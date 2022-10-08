// ----------------------------------------------------------------------------
// --- Name   : OmegaNodes - [https://omega.paideia.global/]
// --- Symbol : Format - {OM}
// --- Supply : Generated from share of each pool 
// --- @title : the Beginning and the End 
// --- 01000110 01101111 01110010 00100000 01110100 01101000 01100101 00100000 01101100 
// --- 01101111 01110110 01100101 00100000 01101111 01100110 00100000 01101101 01111001 
// --- 00100000 01100011 01101000 01101001 01101100 01100100 01110010 01100101 01101110
// --- AlphaDAO.financial - EJS32 - 2021
// --- @dev pragma solidity version:0.8.10+commit.fc410830
// --- SPDX-License-Identifier: MIT
// ----------------------------------------------------------------------------

pragma solidity >=0.4.22 <0.9.0;

// ----------------------------------------------------------------------------
// --- Import ERC20.sol
// ----------------------------------------------------------------------------

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

// ----------------------------------------------------------------------------
// --- Contract Omega
// ----------------------------------------------------------------------------

contract Omega is ERC20 {
  address private owner;
  address private omegaDao;
  uint private limit = 100000000 * 10 ** 18;

  constructor() ERC20('OM token', 'OM') {
    owner = msg.sender;

    _mint(msg.sender, 2000000 * 10 ** 18);
  }

  function setDaoContract(address _omegaDao) public{
    require(msg.sender == owner, 'You must be the owner to run this.');
    omegaDao = _omegaDao;
  }

  function setTranferLimit(uint _limit) public{
    require(msg.sender == owner, 'You must be the owner to run this.');
    limit = _limit;
  }

  function transferFrom(address sender, address recipient, uint256 amount) public override(ERC20) returns (bool) {
    require(amount <= limit, 'This transfer exceeds the allowed limit!');
    return super.transferFrom(sender, recipient, amount);
  }

  function transfer(address recipient, uint256 amount) public override(ERC20) returns (bool) {
    require(amount <= limit, 'This transfer exceeds the allowed limit!');
    return super.transfer(recipient, amount);
  }

  function mint(uint256 _amount) public {
    require(msg.sender == omegaDao || msg.sender == owner, 'Can only be used by OmegaDao or owner.');
    _mint(msg.sender, _amount);
  }

  function burn(uint256 _amount) public {
    require(msg.sender == omegaDao || msg.sender == owner, 'Can only be used by OmegaDao or owner.');
    _burn(msg.sender, _amount);
  }
}
