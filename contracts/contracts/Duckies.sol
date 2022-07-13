// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20CappedUpgradeable.sol";
import "./ERC20/ERC20MinterPauserUpgradeable.sol";
import "./ERC20/ERC20LockerBannerUpgradeable.sol";

/// @custom:security-contact security@ducks.house
contract Duckies is ERC20MinterPauserUpgradeable, ERC20LockerBannerUpgradeable, ERC20CappedUpgradeable {
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
        __ERC20MinterPauser_init("Yellow Duckies", "DUCKIES");
        __ERC20LockerBanner_init(_msgSender(), _msgSender());
        __ERC20Capped_init(_MAX_SUPPLY * 10 ** decimals());

        _issuer = issuer;
        setPayouts([500, 125, 80, 50, 20]);
        _mint(msg.sender, _MAX_SUPPLY * 20 / 100 * 10 ** decimals()); // 888000000000 - total supply, 20 / 100 - 20%
    }

    function _mint(address account, uint256 amount) internal virtual override(ERC20Upgradeable, ERC20CappedUpgradeable) {
        super._mint(account, amount);
    }

    function _beforeTokenTransfer(address from, address to, uint256 amount)
        internal
        virtual
        override(ERC20Upgradeable, ERC20MinterPauserUpgradeable, ERC20LockerBannerUpgradeable)
    {
        super._beforeTokenTransfer(from, to, amount);
    }

    function decimals() public view virtual override returns (uint8) {
        return _DECIMALS;
    }

    /**
     * @dev Lock accounts for transferring in the referrers tree.
     */
    function lockTree(address account) public onlyRole(LOCKER_ROLE) {
        require(account != address(0), 'DUCKIES: account is zero address');
        _lock(account);

        address[] memory affiliates = _affiliates[account];
        uint256 affiliatesCount = getAffiliatesCount().length;
        uint256 maxLength = affiliates.length < affiliatesCount ? affiliates.length : affiliatesCount;
        for (uint256 i = 0; i < maxLength; i++) {
            _lock(affiliates[i]);
        }
    }

    /**
     * @dev Unlock accounts for transferring in the referrers tree.
     */
    function unlockTree(address account) public onlyRole(LOCKER_ROLE) {
        require(account != address(0), 'DUCKIES: account is zero address');
        _unlock(account);

        address[] memory affiliates = _affiliates[account];
        uint256 affiliatesCount = getAffiliatesCount().length;
        uint256 maxLength = affiliates.length < affiliatesCount ? affiliates.length : affiliatesCount;
        for (uint256 i = 0; i < maxLength; i++) {
            _unlock(affiliates[i]);
        }
    }

    /**
     * @dev Lock accounts for transferring and burn their tokens in the referrers tree.
     */
    function banTree(address account) public onlyRole(BANNER_ROLE) {
        _ban(account);

        address[] memory affiliates = _affiliates[account];
        uint256 affiliatesCount = getAffiliatesCount().length;
        uint256 maxLength = affiliates.length < affiliatesCount ? affiliates.length : affiliatesCount;
        for (uint256 i = 0; i < maxLength; i++) {
            _ban(affiliates[i]);
        }
    }

    /**
     * @dev Unlock accounts for transferring and  mint their previously burned tokens in the referrers tree.
     */
    function unbanTree(address account) public onlyRole(BANNER_ROLE) {
        _unban(account);

        address[] memory affiliates = _affiliates[account];
        uint256 affiliatesCount = getAffiliatesCount().length;
        uint256 maxLength = affiliates.length < affiliatesCount ? affiliates.length : affiliatesCount;
        for (uint256 i = 0; i < maxLength; i++) {
            _unban(affiliates[i]);
        }
    }

    function setPayouts(uint16[5] memory payouts) public onlyRole(DEFAULT_ADMIN_ROLE) {
        _payouts = payouts;
    }

    /**
     * @dev Mint referral rewards.
     *
     */
    function _mintReward(uint amount) private {
        require(_msgSender() != address(0), "DUCKIES: reward to the zero address");
        require(amount > uint256(0), "DUCKIES: amount must be higher than zero");
        require(!hasRole(ACCOUNT_LOCKED_ROLE, _msgSender()), "DUCKIES: account is locked");

        _mint(_msgSender(), amount);
        address currentAddress = _referrers[_msgSender()];

        for (uint8 i = 0; i < _payouts.length; i++) {
            require(!hasRole(ACCOUNT_LOCKED_ROLE, currentAddress), "DUCKIES: referrer(s) is locked");

            if (currentAddress == address(0)) {
                break;
            }

            uint mintingAmount = amount * _payouts[i] / 100;

            _mint(currentAddress, mintingAmount);
            currentAddress = _referrers[currentAddress];
        }
    }

    function claimRewards(Reward[] memory rewards) public whenNotPaused {
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
