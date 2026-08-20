// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC1155} from "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";

/// @notice ERC-1155 items held inside the Tester001 token-bound account.
contract Tester001Items is ERC1155, Ownable {
    using Strings for uint256;

    uint256 public constant POTION = 1;
    uint256 public constant POKEBALL = 2;
    uint256 public constant POKEGOLD = 3;
    uint256 public constant RARE_CANDY = 4;

    string private _baseURI;

    constructor(string memory baseURI_, address initialOwner)
        ERC1155("")
        Ownable(initialOwner)
    {
        _baseURI = baseURI_;
    }

    function setURI(string calldata newURI) external onlyOwner {
        _baseURI = newURI;
    }

    function uri(uint256 tokenId) public view override returns (string memory) {
        return string.concat(_baseURI, tokenId.toString(), ".json");
    }

    function mintStarterPack(address to) external onlyOwner {
        uint256[] memory ids = _starterIds();
        uint256[] memory amounts = _starterAmounts();
        _mintBatch(to, ids, amounts, "");
    }

    function mintItem(address to, uint256 id, uint256 amount) external onlyOwner {
        _mint(to, id, amount, "");
    }

    function _starterIds() private pure returns (uint256[] memory ids) {
        ids = new uint256[](4);
        ids[0] = POTION;
        ids[1] = POKEBALL;
        ids[2] = POKEGOLD;
        ids[3] = RARE_CANDY;
    }

    function _starterAmounts() private pure returns (uint256[] memory amounts) {
        amounts = new uint256[](4);
        amounts[0] = 5;
        amounts[1] = 10;
        amounts[2] = 100;
        amounts[3] = 3;
    }
}
