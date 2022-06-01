// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20CappedUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

/// @custom:security-contact security@ducks.house
contract Duckies is Initializable, ERC20CappedUpgradeable, PausableUpgradeable, OwnableUpgradeable {
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

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(address issuer) initializer public {
        __ERC20_init("Yellow Duckies", "DUCKZ");
        __ERC20Capped_init(_MAX_SUPPLY * 10 ** decimals());
        __Pausable_init();
        __Ownable_init();

        _issuer = issuer;
        setPayouts([500, 125, 80, 50, 20]);
        _mint(msg.sender, 444000000000 * 10 ** decimals());
    }

    function decimals() public view virtual override returns (uint8) {
        return _DECIMALS;
    }

    /**
     * @dev Destroys `amount` tokens from the caller.
     *
     */
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
    function burnFrom(address account, uint256 amount) public onlyOwner {
        _spendAllowance(account, _msgSender(), amount);
        _burn(account, amount);
    }

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }

    function setPayouts(uint16[5] memory payouts) public onlyOwner {
        _payouts = payouts;
    }

    function _beforeTokenTransfer(address from, address to, uint256 amount)
        internal
        whenNotPaused
        override
    {
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
            require(isAccountPresentInReferrers(msg.sender, _message.ref));

            _referrers[msg.sender] = _message.ref;
            _affiliates[_message.ref].push(msg.sender);
        } else {
            if (_message.limit != 0) {
                require(_bounty[msg.sender][_message.id] < _message.limit, "Limit of this bounty is exceeded");
            }

            _bounty[msg.sender][_message.id]++;
        }

        _mintReward(_message.amt);
    }

    function isAccountPresentInReferrers(address targetAccount, address refAccount) private view returns (bool) {
        bool notPresent = true;
        address bufAccount = refAccount;

        for (uint8 i = 0; i < 5; i++) {
            if (_referrers[bufAccount] == targetAccount) {
                notPresent = false;
                break;
            }

            bufAccount = _referrers[bufAccount];
        }

        return notPresent;
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
