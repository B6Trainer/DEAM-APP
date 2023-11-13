// SPDX-License-Identifier: MIT
pragma solidity 0.8.0;


import "./DeamMetaverseConfig.sol";
import "./IERC20.sol";
import "hardhat/console.sol";
import "./Membershipcontract.sol";

contract DMToken is IERC20 {
    string public name = "DEAM Metaverse";
    string public symbol = "DMTK";
    uint8 public decimals = 18;
    uint256 public _totalSupply;
    Membershipcontract public membershipContract;
    DeamMetaverseConfig public deamMetaverseConfigContract;
    IERC20 public usdtToken;

    mapping(address => uint256) override public balanceOf;
    mapping(address => mapping(address => uint256)) public allowances;
    mapping(address => uint256) public lastWithdrawTime;
    mapping(address => uint256) public numberOfWithdrawals;
    
    address public owner;
    address public thisContractAddress;
    mapping(address => address) private allowedContracts;

    uint256 public initialSupply =0;
    uint256 public percentageDecimals=10000;

    modifier onlyOwner() {
        require(tx.origin == owner, "DMToken: Only the owner can call this function ");
        _;
    }

    modifier onlyAllowedContract() {
        require(allowedContracts[msg.sender] != address(0), "DMToken: Only the authorized contracts can call this function");
        _;
    }


    function updateAllowedContract(address _allowedContract) external onlyOwner{
        allowedContracts[_allowedContract]=_allowedContract;
    }

    constructor(  ) {        
        _totalSupply = initialSupply * 10**uint256(decimals);
        balanceOf[msg.sender] = _totalSupply;
        owner = msg.sender;

        allowedContracts[owner]=owner;

        emit Transfer(address(0), owner, _totalSupply);
    }

    function mapContracts(address _membershipContractAddress,
                            address _configContractAddress,                            
                            address _usdtToken,
                            address _dmTokenAddress        ) external onlyOwner
    {   
        console.log("DMToken : Executing Contract Mapping");
        if(_dmTokenAddress != address(0)){
            thisContractAddress=_dmTokenAddress;
        }
        if(_membershipContractAddress != address(0)){
            setMemberShipContract(_membershipContractAddress,thisContractAddress);
        }
        if(_configContractAddress != address(0)){
            setDMConfig(_configContractAddress,thisContractAddress);
        }

        if(_usdtToken != address(0)){
            setUSDTToken(_usdtToken);
        }

                   
    }

    function setMemberShipContract(address _membershipContractAddress, address _thisContractAddress) internal
    {   
        require(_membershipContractAddress != address(0), "Invalid address for Membership Contract");        
        membershipContract = Membershipcontract(_membershipContractAddress); 
        membershipContract.updateAllowedContract(_thisContractAddress);               
    }
    
    function setDMConfig(address _configContractAddress, address _thisContractAddress) internal
    {   
        require(_configContractAddress != address(0), "Invalid address for DMConfiguration contract");        
        deamMetaverseConfigContract = DeamMetaverseConfig(_configContractAddress);
        deamMetaverseConfigContract.updateAllowedContract(_thisContractAddress);                
    }

    
    function setUSDTToken(address _usdtToken) internal 
    {   
        require(_usdtToken != address(0), "Invalid address for USDT Token Contract");        
        usdtToken = IERC20(_usdtToken);                
    }





     function totalSupply() external view override  returns (uint256) {
        return _totalSupply;
    }

    function transfer(address sender, address receiver, uint256 amount) external onlyAllowedContract  {
        _transfer(sender, receiver, amount);
    }

    function emittransfer(address sender, address receiver, uint256 amount) external onlyAllowedContract  {
        emit Transfer(sender, receiver, amount);
    }

    function _transfer(address sender, address receiver, uint256 amount) internal  {
        balanceOf[receiver] += amount;
        balanceOf[sender] -= amount;
        emit Transfer(sender, receiver, amount);
    }

    function getBalance(address account) public view returns (uint256) {
         return balanceOf[account];
    }

    function addBalance(address account, uint256 amount) external onlyAllowedContract  {
         
         balanceOf[account] += amount;
    }

    function reduceBalance(address account, uint256 amount) external onlyAllowedContract  {
         
         balanceOf[account] -= amount;
    }



    function deductTransferFee(address from , uint256 amount) internal  returns (uint256) {
        uint256 communityPoolFee = ((amount * deamMetaverseConfigContract.transactionFee_communityPoolFeePercentage()) / (100*percentageDecimals));
        uint256 foundersFee = (amount * deamMetaverseConfigContract.transactionFee_foundersFeePercentage()) / (100*percentageDecimals);
        address comPoolWalletAddress=deamMetaverseConfigContract.communityPoolWallet();
        address founderWalletPoolAddress=deamMetaverseConfigContract.communityPoolWallet();
        _transfer(from, comPoolWalletAddress, communityPoolFee);
        _transfer(from, founderWalletPoolAddress, foundersFee);
        return (amount-communityPoolFee-foundersFee);
    }

    function transfer(address to, uint256 amount) public override returns (bool success) {
        require(to != address(0), "Invalid address");
        require(balanceOf[msg.sender] >= amount, "Insufficient balance");
        uint256 deduction = 0;
        balanceOf[msg.sender] -= amount;
        if (membershipContract.isSubscriber(msg.sender)) {
            deduction = deductTransferFee(msg.sender, amount);
        }
        _transfer(msg.sender, to, amount - deduction);
        return true;
    }

    function approve(address spender, uint256 value) public override returns (bool success) {
        allowances[msg.sender][spender] = value;
        emit Approval(msg.sender, spender, value);
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) override public returns (bool success) {
        require(to != address(0), "Invalid address");
        require(balanceOf[from] >= amount, "Insufficient balance");
        require(allowances[from][msg.sender] >= amount, "Allowance exceeded");
        uint256 deduction = 0;
        if (membershipContract.isSubscriber(msg.sender)) {
            deduction = deductTransferFee(from,amount);
        }
        _transfer(from, to, amount-deduction);
        allowances[from][msg.sender] -= amount;
        return true;
    }

    function burn(address from, uint256 value) public onlyAllowedContract  {
        require(balanceOf[from] >= value, "Insufficient balance");
        balanceOf[from] -= value;
        _totalSupply -= value;
        emit Transfer(from, address(0), value);
    }

    function mint(address to, uint256 value) public onlyAllowedContract  {
        balanceOf[to] += value;
        _totalSupply += value;
        emit Transfer(address(0), to, value);
    }

 
    function swapToDMTK(uint256 amount) external returns (bool) {
        require(amount > 0, "ERC20: Amount must be greater than zero");
        usdtToken.transferFrom(msg.sender, address(this), amount);
        mint(msg.sender, amount);
        return true;
    }
    

    function recoverStuckTokens(address tokenAddress) public onlyOwner{
        IERC20 token = IERC20(tokenAddress);
        uint256 balance = token.balanceOf(address(this));
        require(balance > 0, "No tokens to recover.");
        require(token.transfer(owner, balance), "Token transfer failed.");
    }

    function withdrawNativeCurrency(address payable _to,uint256 _amount) external onlyOwner {
        payable(_to).transfer(_amount);
    }

    function allowance(address _owner, address spender) override external view returns (uint256){

        return allowances[_owner][spender];
    }

}
