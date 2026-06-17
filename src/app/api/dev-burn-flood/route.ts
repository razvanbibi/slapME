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
        const count = Number(body.count);
        if (!amount || !count) {
            return NextResponse.json(
                { error: "Missing params" },
                { status: 400 }
            );
        }

        const provider =
            new ethers.JsonRpcProvider(RPC);

        const wallet =
            new ethers.Wallet(
                PRIVATE_KEY,
                provider
            );

        const token =
            new ethers.Contract(
                TOKEN_ADDRESS,
                TOKEN_ABI,
                wallet
            );

        let nonce =
            await provider.getTransactionCount(
                wallet.address,
                "pending"
            );
        const hashes: string[] = [];

        // safer batch size
        const BATCH_SIZE = 10;

        for (
            let i = 0;
            i < count;
            i += BATCH_SIZE
        ) {

            const batchPromises = [];
            for (
                let j = 0;
                j < BATCH_SIZE &&
                i + j < count;
                j++
            ) {

                const currentNonce = nonce++;
                const promise =
                    wallet.sendTransaction({
                        to: TOKEN_ADDRESS,
                        data:
                            token.interface.encodeFunctionData(
                                "burn",
                                [amount]
                            ),
                        nonce: currentNonce,
                    });
                batchPromises.push(promise);
            }
            const results =
                await Promise.allSettled(
                    batchPromises
                );
            for (const r of results) {
                if (
                    r.status === "fulfilled"
                ) {
                    hashes.push(
                        r.value.hash
                    );
                    console.log(
                        "TX:",
                        r.value.hash
                    );
                } else {
                    console.error(
                        "TX FAILED:",
                        r.reason
                    );
                }
            }
            // cooldow
            await new Promise(
                (r) => setTimeout(r, 300)
            );
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
                    err?.message ||
                    "Relayer failed",
            },
            { status: 500 }
        );
    }
}
