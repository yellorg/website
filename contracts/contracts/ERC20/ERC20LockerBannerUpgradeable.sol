// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlEnumerableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ContextUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

/**
 * @dev {ERC20} token, including:
 *
 *  - a locker role that allows to stop all token transfers for specific accounts
 *  - a banner role that allows to stop all token transfers for specific accounts and burn (destroy) their tokens
 *
 * This contract uses {AccessControl} to lock permissioned functions using the
 * different roles - head to its documentation for details.
 */
abstract contract ERC20LockerBannerUpgradeable is Initializable, ContextUpgradeable, AccessControlEnumerableUpgradeable, ERC20Upgradeable {
    // Account Locking 
    bytes32 public constant LOCKER_ROLE = keccak256("LOCKER_ROLE");
    bytes32 public constant ACCOUNT_LOCKED_ROLE = keccak256("ACCOUNT_LOCKED_ROLE");

    // Account Banning 
    bytes32 public constant BANNER_ROLE = keccak256("BANNER_ROLE");
    bytes32 public constant ACCOUNT_BANNED_ROLE = keccak256("ACCOUNT_BANNED_ROLE");
    mapping(address => uint256) private _bannedBalances;

    /**
     * @dev Grants `LOCKER_ROLE` and `BANNER_ROLE` to the
     * account that specified in the initializer.
     */
    function __ERC20LockerBanner_init(address locker, address banner) internal onlyInitializing {
        __ERC20LockerBanner_init_unchained(locker, banner);
    }

    function __ERC20LockerBanner_init_unchained(address locker, address banner) internal onlyInitializing {
        _setupRole(LOCKER_ROLE, locker);
        _setupRole(BANNER_ROLE, banner);
    }

    /**
     * @dev Lock the account for transferring.
     */
    function lock(address account) public virtual onlyRole(LOCKER_ROLE) {
        _lock(account);
    }

    function _lock(address account) internal virtual {
        require(account != address(0), 'ERC20: account is zero address');
        _grantRole(ACCOUNT_LOCKED_ROLE, account);
    }

    /**
     * @dev Unlock the account for transferring.
     */
    function unlock(address account) public onlyRole(LOCKER_ROLE) {
        _unlock(account);
    }

    function _unlock(address account) internal virtual {
        require(account != address(0), 'ERC20: account is zero address');
        _revokeRole(ACCOUNT_LOCKED_ROLE, account);
    }

    /**
     * @dev Lock the account for transferring and burn their tokens.
     */
    function ban(address account) public onlyRole(BANNER_ROLE) {
        _ban(account);
    }

    function _ban(address account) internal virtual {
        lock(account);
        _grantRole(ACCOUNT_BANNED_ROLE, account);
        uint256 amount = balanceOf(account);
        unchecked {
            _bannedBalances[account] += amount;
        }
        _burn(account, amount);
    }

    /**
     * @dev Unlock the account for transferring and mint their previously burned tokens.
     */
    function unban(address account) public onlyRole(BANNER_ROLE) {
        _unban(account);
    }

    function _unban(address account) internal virtual {
        require(account != address(0), 'ERC20: account is zero address');
        _revokeRole(ACCOUNT_BANNED_ROLE, account);
        uint256 amount = _bannedBalances[account];
        unchecked {
            _bannedBalances[account] -= amount;
        }
        _mint(account, amount);
    }
    
    /**
     * @dev Get total burned amount from the banned account.
     */
    function bannedBalanceOf(address account) public view virtual returns (uint256)  {
        return _bannedBalances[account];
    }

    function _beforeTokenTransfer(address from, address to, uint256 amount)
        internal
        virtual
        override(ERC20Upgradeable)
    {
        require(!hasRole(ACCOUNT_LOCKED_ROLE, from), "ERC20: `from` account is locked");
        require(!hasRole(ACCOUNT_LOCKED_ROLE, to), "ERC20: `to` account is locked");
        super._beforeTokenTransfer(from, to, amount);
    }
}
