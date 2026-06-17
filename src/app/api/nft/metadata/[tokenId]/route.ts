import { NextResponse } from "next/server";
import { getReadOnlyContractServer } from "@/lib/contract.server";
import { getProfile } from "@/lib/profileStore";
import { ethers } from "ethers";
const NFT_CONTRACT = "0x934422770B2dA6d6CcA9CcaFf58523eC45491c43";
const NFT_ABI = [
  "function ownerOf(uint256 tokenId) view returns (address)"
];

export async function GET(
  req: Request,
  { params }: { params: { tokenId: string } }
) {
  const tokenId = Number(params.tokenId);
  const { origin } = new URL(req.url);

  const provider = new ethers.JsonRpcProvider("https://forno.celo.org");
  const nft = new ethers.Contract(NFT_CONTRACT, NFT_ABI, provider);

  const owner: string = await nft.ownerOf(tokenId);
  const profile = await getProfile(owner);
  const { contract } = getReadOnlyContractServer();
  const highestStreak = Number(await contract.highestStreak(owner));

  return NextResponse.json({
    name: profile?.name
      ? `CeloDaily Identity — ${profile.name}`
      : "CeloDaily Identity",
    description: "Dynamic CeloDaily Identity NFT",
    image: `${origin}/api/nft/image/${tokenId}`,
    image_url: `${origin}/api/nft/image/${tokenId}`,
    attributes: [
      {
        trait_type: "Highest Streak",
        value: highestStreak,
      },
    ],
  });
}
