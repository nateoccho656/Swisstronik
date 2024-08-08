const hre = require("hardhat");
const { encryptDataField } = require("@swisstronik/utils");

const sendShieldedTransaction = async (signer, destination, data, value) => {
  const rpcLink = hre.network.config.url;

  const [encryptedData] = await encryptDataField(rpcLink, data);

  return await signer.sendTransaction({
    from: signer.address,
    to: destination,
    data: encryptedData,
    value,
  });
};

async function main() {
  const contractAddress = "0x7a9c581548d125f42AdB362468715602bC8c31FE"; 
  const recipientAddress = "0xD16195c4FF6f2BCA0D7cEB291957AB5088B71509"; 

  const [signer] = await hre.ethers.getSigners();

  const contractFactory = await hre.ethers.getContractFactory("Swisstronik"); 
  const contract = contractFactory.attach(contractAddress);

  const functionName = "mint";
  const functionArgs = [recipientAddress]; 
  const txData = contract.interface.encodeFunctionData(functionName, functionArgs);

  try {
    console.log("Gửi giao dịch. Đang chờ xác nhận...");

    const mintTx = await sendShieldedTransaction(
      signer,
      contractAddress,
      txData,
      0
    );

    await mintTx.wait();

    console.log("Giao dịch mint đã được xác nhận!");
    console.log("Receipt giao dịch: ", mintTx);
  } catch (error) {
    console.error("Lỗi trong quá trình gửi giao dịch hoặc giải mã: ", error);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
