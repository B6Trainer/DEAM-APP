// SPDX-License-Identifier: MIT
pragma solidity 0.8.0;

import "./Membershipcontract.sol";
import "./DMCPdistributor.sol";
import "./DeamMetaverseConfig.sol";
import "./IERC20.sol";
import "./DMToken.sol";
import "hardhat/console.sol";
import "./BaseDMContract.sol";

contract DMInitializer is BaseDMContract {
    Membershipcontract public subscriptionContract;
    DeamMetaverseConfig public deamMetaverseConfigContract;
    DMToken public dmTokenContract;
    DMCPdistributor public dcomdistributor;

    uint256 public minimumWithdrawalLimit = 50 * 10**18;
    uint256 public withdrawalsAllowedADay = 1;

    constructor() {
        console.log("DMInitialzer contract initialised");
    }

    function mapContracts(
        address _membershipContractAddress,
        address _configContractAddress,
        address _dmTokenAddress,
        address _usdtToken,
        address _dcpDistAddress,
        address _dmManagerAddress
    ) external onlyOwner {
        membershipContractAddress = _membershipContractAddress;
        configContractAddress = _configContractAddress;
        dmTokenAddress = _dmTokenAddress;
        usdtTokenAddress = _usdtToken;
        dcpDistAddress = _dcpDistAddress;
        dmManagerAddress = _dmManagerAddress;
        thisContractAddress = _dmManagerAddress;

        if (_membershipContractAddress != address(0)) {
            setMemberShipContract(
                _membershipContractAddress,
                thisContractAddress
            );
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

        if (_usdtToken != address(0)) {
            setUSDTToken(_usdtToken);
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

}
