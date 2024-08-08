const hre = require("hardhat");
const { encryptDataField, decryptNodeResponse } = require("@swisstronik/utils");

const sendShieldedQuery = async (provider, destination, data) => {
  const rpcLink = hre.network.config.url;

  const [encryptedData, usedEncryptionKey] = await encryptDataField(rpcLink, data);

  const response = await provider.call({
    to: destination,
    data: encryptedData,
  });

  return await decryptNodeResponse(rpcLink, response, usedEncryptionKey);
};

async function main() {
  const contractAddress = "0x7a9c581548d125f42AdB362468715602bC8c31FE"; 

  const [signer] = await hre.ethers.getSigners();

  const contractFactory = await hre.ethers.getContractFactory("Swisstronik"); 
  const contract = contractFactory.attach(contractAddress);

  const functionName = "balanceOf";
  const functionArgs = ["0xD16195c4FF6f2BCA0D7cEB291957AB5088B71509"];
  const responseMessage = await sendShieldedQuery(signer.provider, contractAddress, contract.interface.encodeFunctionData(functionName, functionArgs));

  console.log("Decoded response:", contract.interface.decodeFunctionResult(functionName, responseMessage)[0].toString());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
