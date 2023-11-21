// SPDX-License-Identifier: MIT
pragma solidity 0.8.0;

import "./Membershipcontract.sol";
import "./DMCPdistributor.sol";
import "./DeamMetaverseConfig.sol";

import "./DMToken.sol";
import "hardhat/console.sol";
import "./BaseDMContract.sol";
import "./DMManager.sol";

contract DMInitializer is BaseDMContract {
    
    
    Membershipcontract public subscriptionContract;
    DeamMetaverseConfig public deamMetaverseConfigContract;    
    DMCPdistributor public dcomdistributor;
    DMManager public dmManagerContract;
    

    constructor() {
        logDMMessages("DMInitialzer contract initialised");
    }

    
    event logAddress(string message, address cAddress);

    function mapContracts(
        address _usdtToken,
        address _dmTokenAddress,        
        address _configContractAddress,
        address _membershipContractAddress,
        address _dcpDistAddress,
        address _dmManagerAddress,
        address _dmTransactionsAddress
    ) external onlyOwner {

        logDMMessages("DMInitializer : Executing Contract Mapping");

        membershipContractAddress = (_membershipContractAddress != address(0))?_membershipContractAddress:membershipContractAddress;
        configContractAddress = (_configContractAddress != address(0))?_configContractAddress: configContractAddress; 
        dmTokenAddress = (_dmTokenAddress != address(0))?_dmTokenAddress: dmTokenAddress; 
        usdtTokenAddress = (_usdtToken != address(0))?_usdtToken: usdtTokenAddress; 
        dcpDistAddress = (_dcpDistAddress != address(0))?_dcpDistAddress: dcpDistAddress; 
        dmManagerAddress = (_dmManagerAddress != address(0))?_dmManagerAddress: dmManagerAddress; 
        thisContractAddress = address(this);

        
        if (_configContractAddress != address(0)) {
            setDMConfig(_configContractAddress, thisContractAddress);
        }

        if (_dmTokenAddress != address(0)) {
            setDMToken(_dmTokenAddress, thisContractAddress);            
        }


        if (_membershipContractAddress != address(0)) {
            setMemberShipContract(_membershipContractAddress,address(this));            
            subscriptionContract.mapContracts( _configContractAddress );
        }       

        if (_dcpDistAddress != address(0)) {
            setDCPDistributor(_dcpDistAddress, thisContractAddress);
            dcomdistributor.mapContracts(
                _membershipContractAddress,
                _configContractAddress,
                _dmTokenAddress
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
                _dmTransactionsAddress
            );
        }

        logDMMessages("DMInitializer : Completed Executing Contract Mapping");

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
