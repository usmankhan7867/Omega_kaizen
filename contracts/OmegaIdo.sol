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
// --- Contract OmegaIdo
// ----------------------------------------------------------------------------

contract OmegaIdo {
  Omega public omegaAddress;
  Ox public oxAddress;
  address private owner;
  uint public pricePerOmegaPercent;

  constructor(Omega _omegaAddress, Ox _oxAddress, uint _pricePerOmega) {
    owner = msg.sender;
    omegaAddress = _omegaAddress;
    oxAddress = _oxAddress;
    pricePerOmegaPercent = _pricePerOmega;
  }

  function sellOmegaToken(address _buyer, uint _omegaAmount) public {
    require(msg.sender == _buyer, 'You must be the buyer to run this.');
    require(_omegaAmount >= 1 * 10 ** 18, 'You must purchase at least 1 OM token.');

    uint oxAmount = (_omegaAmount * pricePerOmegaPercent) / 100;

    oxAddress.transferFrom(_buyer, address(this), oxAmount);
    omegaAddress.transfer(_buyer, _omegaAmount);
  }

  function updatePrice(uint _price) public {
    require(msg.sender == owner, 'You must be the owner to run this.');
    pricePerOmegaPercent = _price;
  }

  function withdrawOmegaFromIdo(address _to, uint _omegaAmount) public {
    require(msg.sender == owner, 'You must be the owner to run this.');
    omegaAddress.transfer(_to, _omegaAmount);
  }

  function withdrawOxFromIdo(address _to, uint _oxAmount) public {
    require(msg.sender == owner, 'You must be the owner to run this.');
    oxAddress.transfer(_to, _oxAmount);
  }
}
