// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20CappedUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

/// @custom:security-contact security@ducks.house
// FIXME: Use "ERC20PresetMinterPauserUpgradeable" instead
contract Duckies is Initializable, ERC20CappedUpgradeable, PausableUpgradeable, OwnableUpgradeable, AccessControlUpgradeable {
    address private _issuer;

    // Maximum Supply
    uint256 private constant _MAX_SUPPLY = 888000000000;

    // Decimals
    uint8 private constant _DECIMALS = 2;

    // Affiliate Tree
    mapping(address => address) private _referrers;
    mapping(address => address[]) private _affiliates;

    // Affiliate Payouts
    uint16[] public _payouts;

    // Participants
    mapping(address => mapping(string => uint16)) private _bounty;

    // Account Locking 
    bytes32 LOCKED_ROLE = keccak256('LOCKED_ROLE');

    // Account Banning
    bytes32 BANNED_ROLE = keccak256('BANNED_ROLE');
    mapping(address => uint256) private _bannedBalances;

    struct Message {
        string  id;
        address ref;
        uint32  amt;
        uint256 blockExpiration;
        uint16  limit;
    }

    struct Reward {
        Message message;
        bytes   signature;
    }

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(address issuer) initializer public {
        __ERC20_init("Yellow Duckies", "DUCKIES");
        __ERC20Capped_init(_MAX_SUPPLY * 10 ** decimals());
        __Pausable_init();
        __Ownable_init();
        _grantRole(DEFAULT_ADMIN_ROLE, _msgSender());

        _issuer = issuer;
        setPayouts([500, 125, 80, 50, 20]);
        _mint(msg.sender, _MAX_SUPPLY * 20 / 100 * 10 ** decimals()); // 888000000000 - total supply, 20 / 100 - 20%
    }

    function decimals() public view virtual override returns (uint8) {
        return _DECIMALS;
    }

    /**
     * @dev Destroys `amount` tokens from the caller.
     *
     */
    // FIXME: Use "ERC20PresetMinterPauserUpgradeable" instead
    function burn(uint256 amount) public onlyOwner {
        _burn(_msgSender(), amount);
    }

    /**
     * @dev Destroys `amount` tokens from `account`, deducting from the caller's
     * allowance.
     *
     * Requirements:
     *
     * - the caller must have allowance for ``accounts``'s tokens of at least
     * `amount`.
     */
    // FIXME: Use "ERC20PresetMinterPauserUpgradeable" instead
    function burnFrom(address account, uint256 amount) public onlyOwner {
        _spendAllowance(account, _msgSender(), amount);
        _burn(account, amount);
    }

    // FIXME: Use "ERC20PresetMinterPauserUpgradeable" instead
    function pause() public onlyOwner {
        _pause();
    }

    // FIXME: Use "ERC20PresetMinterPauserUpgradeable" instead
    function unpause() public onlyOwner {
        _unpause();
    }

    // FIXME: Use "ERC20PresetMinterPauserUpgradeable" instead
    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }

    /**
     * @dev Lock accounts for trasnferring for the whole tree.
     * @dev To lock only specific account, Please use `grantRole` function instead.
     * TODO: function's document
     */
    function lock(address account) public onlyOwner {
        require(account != address(0), 'ERC20: account is zero address');
        _grantRole(LOCKED_ROLE, account);
        /**
         * TODO: lock accounts for the whole tree.
         */
    }

    /**
     * @dev Unlock accounts for trasnferring for the whole tree.
     * @dev To unlock only specific account, Please use `revokeRole` function instead.
     * TODO: function's document
     */
    function unlock(address account) public onlyOwner {
        require(account != address(0), 'ERC20: account is zero address');
        _revokeRole(LOCKED_ROLE, account);
        /**
         * TODO: unlock accounts for the whole tree.
         */
    }

    /**
     * @dev Lock accounts for trasnferring and burn their tokens for the whole tree.
     * TODO: function's document
     */
    function ban(address account) public onlyOwner {
        lock(account);
        _grantRole(BANNED_ROLE, account);
        uint256 amount = balanceOf(account);
        unchecked {
            _bannedBalances[account] += amount;
        }
        _burn(account, amount);
        /**
         * TODO: ban accounts for the whole tree.
         */
    }

    /**
     * @dev Unlock accounts for trasnferring and mint their previously burnt tokens for the whole tree.
     * TODO: function's document
     */
    function unban(address account) public onlyOwner {
        require(account != address(0), 'ERC20: account is zero address');
        _revokeRole(BANNED_ROLE, account);
        uint256 amount = _bannedBalances[account];
        unchecked {
            _bannedBalances[account] -= amount;
        }
        _mint(account, amount);
        /**
         * TODO: unban accounts for the whole tree.
         */
    }

    function setPayouts(uint16[5] memory payouts) public onlyOwner {
        _payouts = payouts;
    }

    function _beforeTokenTransfer(address from, address to, uint256 amount)
        internal
        whenNotPaused
        override
    {
        require(!hasRole(LOCKED_ROLE, from), "ERC20: `from` account is locked");
        require(!hasRole(LOCKED_ROLE, to), "ERC20: `to` account is locked");
        super._beforeTokenTransfer(from, to, amount);
    }

    /**
     * @dev Mint referral rewards.
     *
     */
    function _mintReward(uint amount) private {
        require(msg.sender != address(0), "ERC20: reward to the zero address");
        require(amount > uint256(0), "ERC20: amount must be higher than zero");

        _mint(msg.sender, amount);
        address currentAddress = _referrers[msg.sender];

        for (uint8 i = 0; i < _payouts.length; i++) {
            if (currentAddress == address(0)) {
                break;
            }

            uint mintingAmount = amount * _payouts[i] / 100;

            _mint(currentAddress, mintingAmount);
            currentAddress = _referrers[currentAddress];
        }
    }

    function claimRewards(Reward[] memory rewards) public {
        for (uint8 i = 0; i < rewards.length; i++) {
            reward(rewards[i].message, rewards[i].signature);
        }
    }

    // reward method is used to retriave the reward from invitation link or claim the bounty for some bounty task
    function reward(Message memory _message, bytes memory _sig) public
    {
        bytes32 messageHash = getMessageHash(_message);
        bytes32 ethSignedMessageHash = getEthSignedMessageHash(messageHash);

        require(block.number <= _message.blockExpiration, "Message is expired");
        require(recover(ethSignedMessageHash, _sig) == _issuer);

        if (_message.ref != address(0)) {
            require(_referrers[msg.sender] == address(0));
            require(msg.sender != _message.ref);
            require(isAccountNotInReferrers(msg.sender, _message.ref));
            require(_affiliates[msg.sender].length == 0);

            _referrers[msg.sender] = _message.ref;
            _affiliates[_message.ref].push(msg.sender);
        } else {
            if (_message.limit != 0) {
                require(_bounty[msg.sender][_message.id] < _message.limit, "Limit of this bounty is exceeded");
            }
        }

        _mintReward(_message.amt);
        _bounty[msg.sender][_message.id]++;
    }

    function isAccountNotInReferrers(address targetAccount, address refAccount) private view returns (bool) {
        address bufAccount = refAccount;

        for (uint8 i = 0; i < 5; i++) {
            if (_referrers[bufAccount] == targetAccount) {
                return false;
            }

            bufAccount = _referrers[bufAccount];
        }

        return true;
    }

    function getMessageHash(Message memory _message) public pure returns (bytes32)
    {
        return keccak256(abi.encode(_message));
    }

    function getEthSignedMessageHash(bytes32 _messageHash) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(
            "\x19Ethereum Signed Message:\n32",
            _messageHash
        ));
    }

    function recover(bytes32 _ethSignedMessageHash, bytes memory _sig)
        public pure returns (address)
    {
        (bytes32 r, bytes32 s, uint8 v) = _split(_sig);
        return ecrecover(_ethSignedMessageHash, v, r, s);
    }

    function _split(bytes memory _sig) internal pure
        returns (bytes32 r, bytes32 s, uint8 v)
    {
        require(_sig.length == 65, "invalid signature length");

        assembly {
            r := mload(add(_sig, 32))
            s := mload(add(_sig, 64))
            v := byte(0, mload(add(_sig, 96)))
        }
    }

    function getPayouts() public view returns (uint16[] memory) {
        return _payouts;
    }

    function getAffiliatesCount() public view returns (uint8[5] memory)  {
        return getAffiliatesCountByLevel(msg.sender, 1, [0, 0, 0, 0, 0]);
    }

    function getAffiliatesCountByLevel(address currentAccount, uint16 level, uint8[5] memory count) private view returns (uint8[5] memory) {
        if (level <= 5) {
            address[] memory affiliates = _affiliates[currentAccount];
            count[level - 1] += uint8(affiliates.length);

            for (uint i = 0; i < affiliates.length; i++) {
                getAffiliatesCountByLevel(affiliates[i], level + 1, count);
            }
        }

        return count;
    }

    function getAccountBountyLimit(string memory bountyID) public view returns (uint16) {
        return _bounty[msg.sender][bountyID];
    }
}
