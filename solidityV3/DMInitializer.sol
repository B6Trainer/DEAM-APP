// SPDX-License-Identifier: MIT
pragma solidity 0.8.0;

import "./Membershipcontract.sol";
import "./DMCPdistributor.sol";
import "./DeamMetaverseConfig.sol";
import "./IERC20.sol";
import "./DMToken.sol";
import "hardhat/console.sol";
import "./BaseDMContract.sol";
import "./DMManager.sol";

contract DMInitializer is BaseDMContract {
    
    
    Membershipcontract public subscriptionContract;
    DeamMetaverseConfig public deamMetaverseConfigContract;
    DMToken public dmTokenContract;
    DMCPdistributor public dcomdistributor;
    DMManager public dmManagerContract;
    //IERC20 public 

    constructor() {
        console.log("DMInitialzer contract initialised");
    }

    
    event logAddress(string message, address cAddress);
    function mapContracts(
        address _membershipContractAddress,
        address _configContractAddress,
        address _dmTokenAddress,
        address _usdtToken,
        address _dcpDistAddress,
        address _dmManagerAddress
    ) external onlyOwner {

        //console.log("DMInitializer : Executing Contract Mapping");
        emit logMessage("DMInitializer : Executing Contract Mapping");

        membershipContractAddress = (_membershipContractAddress != address(0))?_membershipContractAddress:membershipContractAddress;
        configContractAddress = (_configContractAddress != address(0))?_configContractAddress: configContractAddress; 
        dmTokenAddress = (_dmTokenAddress != address(0))?_dmTokenAddress: dmTokenAddress; 
        usdtTokenAddress = (_usdtToken != address(0))?_usdtToken: usdtTokenAddress; 
        dcpDistAddress = (_dcpDistAddress != address(0))?_dcpDistAddress: dcpDistAddress; 
        dmManagerAddress = (_dmManagerAddress != address(0))?_dmManagerAddress: dmManagerAddress; 
        thisContractAddress = address(this);

        emit logAddress("membershipContractAddress :",membershipContractAddress);
        emit logAddress("configContractAddress :",configContractAddress);

        if (_membershipContractAddress != address(0)) {
            setMemberShipContract(_membershipContractAddress,address(this));
        }
        if (_configContractAddress != address(0)) {
            setDMConfig(_configContractAddress, thisContractAddress);
        }
        if (_dmTokenAddress != address(0)) {
            setDMToken(_dmTokenAddress, thisContractAddress);
            dmTokenContract.mapContracts(
                membershipContractAddress,
                configContractAddress,
                usdtTokenAddress,
                dmTokenAddress
            );
        }


        if (_dcpDistAddress != address(0)) {
            setDCPDistributor(_dcpDistAddress, thisContractAddress);
            dcomdistributor.mapContracts(
                _membershipContractAddress,
                _configContractAddress,
                _dmTokenAddress,
                _dcpDistAddress
            );
        }

        if (_dmManagerAddress != address(0)) {
            setDMManager(_dmManagerAddress, thisContractAddress);

            dmManagerContract.mapContracts(
                _membershipContractAddress,
                _configContractAddress,
                _dmTokenAddress,
                _usdtToken,                
                _dcpDistAddress,
                _dmManagerAddress
            );
        }

    }

    function setMemberShipContract(
        address _membershipContractAddress,
        address _thisContractAddress
    ) internal {
        require(
            _membershipContractAddress != address(0),
            "Invalid address for Membership Contract"
        );
        subscriptionContract = Membershipcontract(_membershipContractAddress);
        subscriptionContract.updateAllowedContract(_thisContractAddress);
    }

    function setDMConfig(
        address _configContractAddress,
        address _thisContractAddress
    ) internal {
        require(
            _configContractAddress != address(0),
            "Invalid address for DMConfiguration contract"
        );
        deamMetaverseConfigContract = DeamMetaverseConfig(
            _configContractAddress
        );
        deamMetaverseConfigContract.updateAllowedContract(_thisContractAddress);
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

    function setDCPDistributor(
        address _dcpDistAddress,
        address _thisContractAddress
    ) internal {
        require(
            _dcpDistAddress != address(0),
            "Invalid address for DCPDistributor Contract"
        );
        dcomdistributor = DMCPdistributor(_dcpDistAddress);
        dcomdistributor.updateAllowedContract(_thisContractAddress);
    }

     function setDMManager(
        address _dmManagerAddress,
        address _thisContractAddress
    ) internal {
        require(
            _dmManagerAddress != address(0),
            "Invalid address for DMManager Contract"
        );
        dmManagerContract = DMManager(_dmManagerAddress);
        dmManagerContract.updateAllowedContract(_thisContractAddress);
    }

}
