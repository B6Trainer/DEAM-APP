// SPDX-License-Identifier: MIT
pragma solidity 0.8.0;
import "hardhat/console.sol";
import "./IERC20.sol";

abstract contract BaseDMContract {

    address public owner;    
    mapping(address => address) private allowedContracts;

    address membershipContractAddress;
    address configContractAddress;
    address dmTokenAddress;
    address usdtTokenAddress;
    address dcpDistAddress;
    address dmManagerAddress;
    address thisContractAddress;

    IERC20 public usdtToken;

    modifier onlyOwner() {

        string memory errormessage =string(abi.encodePacked("MembershipContract: Only the contract owner can call this function. Owner: ",
                                            addressToString(owner),
                                            " MsgSender: ",addressToString(msg.sender),
                                            " tx.origin: ",addressToString(tx.origin)
                                            ));

        require(tx.origin == owner,errormessage);
        _;
    }

    modifier onlyAllowedContract() {
        require(allowedContracts[msg.sender] != address(0), "DeamMetaverseConfig: Only the authorized contracts can call this function");
        _;
    }


    function updateAllowedContract(address _allowedContract) external onlyOwner{
        allowedContracts[_allowedContract]=_allowedContract;
    }

    constructor() {
      owner = msg.sender;
      allowedContracts[owner]=owner;
      console.log("BaseDMContract initialised");
    }

   //Method to convert address into string
    function addressToString(address _address) public pure returns(string memory) {
        bytes32 _bytes = bytes32(uint256(uint160(_address)));
        bytes memory HEX = "0123456789abcdef";
        bytes memory _string = new bytes(42);
        _string[0] = '0';
        _string[1] = 'x';
        for(uint i = 0; i < 20; i++) {
            _string[2+i*2] = HEX[uint8(_bytes[i + 12] >> 4)];
            _string[3+i*2] = HEX[uint8(_bytes[i + 12] & 0x0f)];
        }
        return string(_string);
    }

    function setUSDTToken(address _usdtToken) internal 
    {   
        require(_usdtToken != address(0), "Invalid address for USDT Token Contract");        
        usdtToken = IERC20(_usdtToken);                
    }

}