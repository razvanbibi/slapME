import { NextRequest, NextResponse } from "next/server";
import { ethers } from "ethers";

const RPC = process.env.CELO_RPC!;
const PRIVATE_KEY = process.env.RELAYER_PRIVATE_KEY!;

const TOKEN_ADDRESS =
    "0xF3473730b41f0F5720bC8AA8fade0480062125bA";

const TOKEN_ABI = [
    "function burn(uint256 amount) external"
];

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        const amount = body.amount;
        const count = body.count;

        if (!amount || !count) {
            return NextResponse.json(
                { error: "Missing params" },
                { status: 400 }
            );
        }

        const provider = new ethers.JsonRpcProvider(RPC);

        const wallet = new ethers.Wallet(
            PRIVATE_KEY,
            provider
        );

        const token = new ethers.Contract(
            TOKEN_ADDRESS,
            TOKEN_ABI,
            wallet
        );

        const hashes: string[] = [];

        for (let i = 0; i < count; i++) {
            try {
                const tx = await token.burn(amount);

                hashes.push(tx.hash);

                console.log(
                    `Burn ${i + 1}/${count}`,
                    tx.hash
                );

            } catch (err) {
                console.error(
                    `Burn ${i + 1} failed`,
                    err
                );
            }
        }

        return NextResponse.json({
            success: true,
            total: hashes.length,
            hashes,
        });

    } catch (err: any) {
        console.error(err);

        return NextResponse.json(
            {
                error:
                    err?.message || "Relayer failed",
            },
            { status: 500 }
        );
    }
}