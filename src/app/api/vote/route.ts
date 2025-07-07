import { Connection, PublicKey, Transaction } from '@solana/web3.js'
import { ACTIONS_CORS_HEADERS, ActionPostRequest, createPostResponse } from '@solana/actions'
import { Voting } from '@/../../anchor/target/types/voting'
import IDL from '../../../../anchor/target/idl/voting.json'
import { BN, Program } from '@coral-xyz/anchor'

export const OPTIONS = GET

const JSON_RPC_URL = 'http://127.0.0.1:8899'
const COMMITMENT_STATUS = 'confirmed'

export async function GET(request: Request) {
  const actionMetadata = {
    label: 'Vote',
    icon: 'https://www.longwarjournal.org/wp-content/uploads/2025/06/israel-vs-iran-800.jpg',
    title: "Who's going to win the war?",
    description: 'Vote between Iran and Israel',
    links: {
      actions: [
        {
          label: 'Vote for Iran',
          href: '/api/vote?candidate=iran',
        },
        {
          label: 'Vote for Israel',
          href: '/api/vote?candidate=israel',
        },
      ],
    },
  }

  return Response.json(actionMetadata, {
    headers: ACTIONS_CORS_HEADERS,
  })
}

export async function POST(request: Request) {
  const url = new URL(request.url)
  const candidate = url.searchParams.get('candidate')

  if (candidate !== 'iran' && candidate !== 'israel') {
    return new Response('Invalid candidate', { status: 400, headers: ACTIONS_CORS_HEADERS })
  }

  const connection = new Connection(JSON_RPC_URL, COMMITMENT_STATUS)
  const program: Program<Voting> = new Program(IDL as Voting, { connection })

  const body: ActionPostRequest = await request.json()
  let voter

  try {
    voter = new PublicKey(body.account)
  } catch (error) {
    return new Response('Invalid account', { status: 400, headers: ACTIONS_CORS_HEADERS })
  }

  const instruction = await program.methods.vote(candidate, new BN(1)).accounts({ signer: voter }).instruction()

  const latestBlockhash = await connection.getLatestBlockhash()

  console.log({ instruction, latestBlockhash })

  const transaction = new Transaction({
    feePayer: voter,
    blockhash: latestBlockhash.blockhash,
    lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
  }).add(instruction)

  const response = await createPostResponse({
    fields: {
      transaction,
      type: 'transaction',
      message: 'Vote successfully created',
    },
  })

  return Response.json(response, { headers: ACTIONS_CORS_HEADERS })
}
