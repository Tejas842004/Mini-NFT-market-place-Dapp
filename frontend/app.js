let provider;
let signer;
let contract;

// Replace with your deployed contract address
const contractAddress = "YOUR_CONTRACT_ADDRESS_HERE";

// ABI of Marketplace.sol (simplified)
const abi = [
    "function mintNFT(string memory tokenURI, uint256 price) public returns (uint256)",
    "function buyNFT(uint256 tokenId) public payable",
    "function getItem(uint256 tokenId) public view returns (tuple(uint256 tokenId, address seller, uint256 price, bool sold))"
];

async function connectWallet() {
    if (window.ethereum) {
        provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        signer = provider.getSigner();
        contract = new ethers.Contract(contractAddress, abi, signer);
        alert("Wallet connected!");
        loadNFTs();
    } else {
        alert("Please install MetaMask!");
    }
}

async function mintNFT() {
    const tokenURI = document.getElementById("tokenURI").value;
    const price = ethers.utils.parseEther(document.getElementById("price").value);
    const tx = await contract.mintNFT(tokenURI, price);
    await tx.wait();
    alert("NFT Minted!");
    loadNFTs();
}

async function loadNFTs() {
    const nftListDiv = document.getElementById("nftList");
    nftListDiv.innerHTML = "";

    // Assuming a small number of NFTs
    for (let i = 1; i <= 10; i++) {
        try {
            const item = await contract.getItem(i);
            if (!item.sold) {
                const div = document.createElement("div");
                div.innerHTML = `
                    <p>NFT ID: ${item.tokenId}</p>
                    <p>Price: ${ethers.utils.formatEther(item.price)} ETH</p>
                    <button onclick="buyNFT(${item.tokenId}, '${item.price}')">Buy NFT</button>
                    <hr>
                `;
                nftListDiv.appendChild(div);
            }
        } catch (err) {
            // NFT not minted yet
        }
    }
}

async function buyNFT(tokenId, price) {
    const tx = await contract.buyNFT(tokenId, { value: price });
    await tx.wait();
    alert("NFT Purchased!");
    loadNFTs();
}

document.getElementById("connectWallet").onclick = connectWallet;
document.getElementById("mintNFT").onclick = mintNFT;
