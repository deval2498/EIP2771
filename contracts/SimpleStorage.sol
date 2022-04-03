// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@opengsn/contracts/src/BaseRelayRecipient.sol";
import "./EIP712/EIP712MetaTransaction.sol";

contract SimpleStorage is EIP712MetaTransaction {
    string data;
    address public owner;

    modifier onlyOwner() {
        require(owner == msg.sender, "");
        _;
    }

    /**
     * Set the trustedForwarder address either in constructor or
     * in other init function in your contract
     */
    constructor() EIP712MetaTransaction("SimpleStorage","1",42) {
        
        data = "Hello Metatransaction";
        owner = msg.sender;
    }

    /**
     * OPTIONAL
     * You should add one setTrustedForwarder(address _trustedForwarder)
     * method with onlyOwner modifier so you can change the trusted
     * forwarder address to switch to some other meta transaction protocol
     * if any better protocol comes tomorrow or current one is upgraded.
     */

    /**
     * Override this function.
     * This version is to keep track of BaseRelayRecipient you are using
     * in your contract.
     */

    function getStorage() public view returns (string memory) {
        return data;
    }

    function setStorage(string memory _newData) public {
        data = _newData;
    }
}
