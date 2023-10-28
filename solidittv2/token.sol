// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IERC20 {
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
}

contract PaymentGateway {
    address public owner;
    address public masterWallet;
    mapping(address => bool) public supportedTokens;

    event TokensReceived(address indexed sender, address indexed token, uint256 amount);

    constructor(address _masterWallet, address[] memory _supportedTokens) {
        owner = msg.sender;
        masterWallet = _masterWallet;
        
        for (uint256 i = 0; i < _supportedTokens.length; i++) {
            supportedTokens[_supportedTokens[i]] = true;
        }
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can call this function");
        _;
    }

    function setMasterWallet(address _newMasterWallet) external onlyOwner {
        require(_newMasterWallet != address(0), "Invalid address");
        masterWallet = _newMasterWallet;
    }

    function receiveTokens(address _tokenAddress, uint256 _amount) external {
        require(supportedTokens[_tokenAddress], "Token not supported");
        require(_amount > 0, "Amount must be greater than 0");

        IERC20 token = IERC20(_tokenAddress);
        require(token.transferFrom(msg.sender, masterWallet, _amount), "Token transfer to master wallet failed");

        emit TokensReceived(msg.sender, _tokenAddress, _amount);
    }
}
