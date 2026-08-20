// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";

/// @notice ERC-721 hero NFT whose token #1 owns an ERC-6551 account.
contract Tester001 is ERC721, Ownable {
    using Strings for uint256;

    string private _baseTokenURI;
    uint256 private _nextTokenId = 1;

    constructor(string memory baseTokenURI, address initialOwner)
        ERC721("Tester001", "T001")
        Ownable(initialOwner)
    {
        _baseTokenURI = baseTokenURI;
    }

    function mint(address to) external onlyOwner returns (uint256 tokenId) {
        tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
    }

    function setBaseURI(string calldata newBaseURI) external onlyOwner {
        _baseTokenURI = newBaseURI;
    }

    function baseURI() external view returns (string memory) {
        return _baseTokenURI;
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);
        return string.concat(_baseTokenURI, tokenId.toString(), ".json");
    }
}
