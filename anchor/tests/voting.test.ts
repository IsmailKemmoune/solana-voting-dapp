import { BankrunProvider, startAnchor } from 'anchor-bankrun'
import { PublicKey } from '@solana/web3.js'
import { BN, Program } from '@coral-xyz/anchor'
import { Voting } from '../target/types/voting'
import IDL from '../target/idl/voting.json'
import { beforeAll, expect } from '@jest/globals'
const votingAddress = new PublicKey('FqzkXZdwYjurnUKetJCAvaUw5WAqbwzU6gZEwydeEfqS')

describe('Voting', () => {
  let context
  let provider: BankrunProvider
  let votingProgram: Program<Voting>

  beforeAll(async () => {
    context = await startAnchor('', [{ name: 'voting', programId: votingAddress }], [])

    provider = new BankrunProvider(context)

    votingProgram = new Program<Voting>(IDL, provider)
  })

  it('Initialize Poll', async () => {
    await votingProgram.methods.initializePoll(new BN(1), 'this is a description', new BN(0), new BN(1850536880)).rpc()

    const [pollAddress] = PublicKey.findProgramAddressSync([new BN(1).toArrayLike(Buffer, 'le', 8)], votingAddress)

    const poll = await votingProgram.account.poll.fetch(pollAddress)
    console.log(poll, 'poll')

    expect(poll.pollId.toNumber()).toEqual(1)
    expect(poll.description).toEqual('this is a description')
    expect(poll.pollStart.toNumber()).toBeLessThan(poll.pollEnd.toNumber())
  })

  it('Initialize Candidate', async () => {
    await votingProgram.methods.initializeCandidate('Candidate 1', new BN(1)).rpc()
    await votingProgram.methods.initializeCandidate('Candidate 2', new BN(1)).rpc()

    const [firstCandidateAddress] = PublicKey.findProgramAddressSync(
      [Buffer.from('Candidate 1'), new BN(1).toArrayLike(Buffer, 'le', 8)],
      votingAddress,
    )
    const [secondCandidateAddress] = PublicKey.findProgramAddressSync(
      [Buffer.from('Candidate 2'), new BN(1).toArrayLike(Buffer, 'le', 8)],
      votingAddress,
    )

    const firstCandidate = await votingProgram.account.candidate.fetch(firstCandidateAddress)
    const secondCandidate = await votingProgram.account.candidate.fetch(secondCandidateAddress)
    console.log({ firstCandidate, secondCandidate }, 'candidates')

    expect(firstCandidate.candidateName).toEqual('Candidate 1')
    expect(secondCandidate.candidateName).toEqual('Candidate 2')
    expect(firstCandidate.candidateVotes.toNumber()).toEqual(0)
    expect(secondCandidate.candidateVotes.toNumber()).toEqual(0)
  })
})
