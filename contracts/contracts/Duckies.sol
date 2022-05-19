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
    uint256 private constant _MAX_SUPPLY = 888000000000000;

    // Affiliate Tree
    mapping(address => address) private _referrers;

    // Affiliate Payouts
    uint16[] public _payouts;

    struct Message {
        address ref;
        uint32 amt;
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
        _mint(msg.sender, 44400000000000 * 10 ** decimals());
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

    function _beforeTokenTransfer(address from, address to, uint256 amount)
        internal
        whenNotPaused
        override
    {
        super._beforeTokenTransfer(from, to, amount);
    }

    function reward(Message memory _message, bytes memory _sig) public
    {
        bytes32 messageHash = getMessageHash(_message);
        bytes32 ethSignedMessageHash = getEthSignedMessageHash(messageHash);

        if (recover(ethSignedMessageHash, _sig) == _issuer) {
            if (_message.ref != address(0) && _referrers[msg.sender] == address(0)) {
                _referrers[msg.sender] = _message.ref;
            }
            _mintReward(_message.amt);
        }
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
}
