// SPDX-License-Identifier: MIT
pragma solidity 0.8.0;
import "hardhat/console.sol";
import "./IBEP20.sol";
import "./DMToken.sol";

abstract contract BaseDMContract {

    address public owner;    
    mapping(address => address) allowedContracts;

    address membershipContractAddress;
    address configContractAddress;
    address dmTokenAddress;
    address usdtTokenAddress;
    address dcpDistAddress;
    address dmManagerAddress;
    address dmTransactionsAddress;
    address thisContractAddress;

    IBEP20 public usdtToken;
    DMToken public dmTokenContract;

    modifier onlyOwner() {

        string memory errormessage =string(abi.encodePacked("BaseDMContract: Only the contract owner can call this function. Owner: ",
                                            addressToString(owner),
                                            " MsgSender: ",addressToString(msg.sender),
                                            " tx.origin: ",addressToString(tx.origin)
                                            ));

        require(tx.origin == owner,errormessage);
        _;
    }

    modifier onlyAllowedContract() {

        string memory errormessage =string(abi.encodePacked("BaseDMContract: Only the allowed contracts can call this function. Owner: ",
                                            addressToString(owner),
                                            " Calling contract MsgSender: ",addressToString(msg.sender),
                                            " Calling contract tx.origin: ",addressToString(tx.origin),
                                            " From the map: ",addressToString(allowedContracts[msg.sender]),
                                             " Owner contract : ", addressToString(allowedContracts[owner])
                                            ));
        //logDMMessages(errormessage);
        require(allowedContracts[msg.sender] != address(0), errormessage);

        //require(1 == 1, errormessage); // Only for development
        _;
    }


    function updateAllowedContract(address _allowedContract) external onlyOwner{
        allowedContracts[_allowedContract]=_allowedContract;
        string memory message =string(abi.encodePacked("DM contract : ",
                                            addressToString(allowedContracts[_allowedContract]),
                                            " registered with contrct : ",addressToString(address(this)),
                                            " Owner contract : ",
                                            addressToString(allowedContracts[owner])
                                            ));

        logDMMessages(message);
    }

    constructor() {
      owner = msg.sender;
      allowedContracts[owner]=owner;
      logDMMessages(
      string(abi.encodePacked("BaseDMContract initialised & allowed contracts updated ",
                                            addressToString(allowedContracts[owner]),
                                            " with contract address: ",addressToString(address(this))
                                            )));
    }

    function setUSDTToken(address _usdtToken) internal 
    {   
        require(_usdtToken != address(0), "Invalid address for USDT Token Contract");        
       usdtToken = IBEP20(_usdtToken);                
    }

    function setDMToken(address _dmTokenAddress, address _thisContractAddress)
        internal
    {
        require(
            _dmTokenAddress != address(0),
            "Invalid address for DM Token Contract"
        );
        dmTokenContract = DMToken(_dmTokenAddress);
        dmTokenContract.updateAllowedContract(_thisContractAddress);
    }

   //Method to convert address into string
    function addressToString(address _address) internal pure returns(string memory) {
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

    function uintToString(uint256 _i) internal pure returns (string memory) {
        if (_i == 0) {
            return "0";
        }

        uint256 j = _i;
        uint256 len;

        while (j != 0) {
            len++;
            j /= 10;
        }

        bytes memory bstr = new bytes(len);

        while (_i != 0) {
            len -= 1;
            bstr[len] = bytes1(uint8(48 + _i % 10));
            _i /= 10;
        }

        return string(bstr);
    }


    function getContractAddress() public view returns(address _address) {
        
        _address=address(this);
        return _address;

    }

    function logDMMessages(string memory message) internal   {
        
        emit logMessage(message);
        console.log(message);
     
    }

    event  logMessage(string message);

    //Transfer DMTK to receiver
    function transferDMTK(uint256 amount, address receiver) external onlyOwner returns (bool) {
        
       
        require(amount > 0, "Contract: DMTK Withdraw amount must be greater than zero");
        uint256 avlamount = dmTokenContract.balanceOf(msg.sender);
        require(avlamount >= amount, "Contract: Insufficient DMTK balance");
       
        dmTokenContract.transfer(receiver, amount);
 
        return true;

    }


    //Transfer USDT to receiver
    function transferUSDT(uint256 amount, address receiver) external onlyOwner returns (bool) {
       
        require(amount > 0, "Contract: Withdraw amount must be greater than zero");
        uint256 avlamount = usdtToken.balanceOf(msg.sender);
        require(avlamount >= amount, "Contract: Insufficient USDT balance");
       
        usdtToken.transfer(receiver, amount);
 
        return true;

    }
}