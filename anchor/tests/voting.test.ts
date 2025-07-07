import { BankrunProvider, startAnchor } from 'anchor-bankrun'
import { PublicKey } from '@solana/web3.js'
import { BN, Program } from '@coral-xyz/anchor'
import { Voting } from '../target/types/voting'
import IDL from '../target/idl/voting.json'
import { beforeAll, describe, expect, it } from '@jest/globals'

const PROGRAM_ID = new PublicKey('devvZXye2LMD4miQiHDLuz7qjEWvgwCztCpcjvy45Vr')

describe('Voting', () => {
  let context
  let provider: BankrunProvider
  let votingProgram: Program<Voting>

  beforeAll(async () => {
    context = await startAnchor('', [{ name: 'voting', programId: PROGRAM_ID }], [])

    provider = new BankrunProvider(context)

    votingProgram = new Program<Voting>(IDL as Voting, provider)
  })

  it('Initialize Poll', async () => {
    const pollId = 1
    const pollDescription = "Who's going to win the war?"
    const pollStart = new BN(Math.floor(Date.now() / 1000))
    const pollEnd = new BN(Math.floor(Date.now() / 1000) + 86400 * 30)

    console.log('Initializing poll...')
    // Initialize poll
    const pollTransaction = await votingProgram.methods
      .initializePoll(new BN(pollId), pollDescription, pollStart, pollEnd)
      .rpc()

    console.log('Poll Transaction', pollTransaction)
    console.log('Poll initialized successfully')

    const [pollAddress] = PublicKey.findProgramAddressSync([new BN(1).toArrayLike(Buffer, 'le', 8)], PROGRAM_ID)

    const poll = await votingProgram.account.poll.fetch(pollAddress)
    console.log(poll, 'Poll')

    expect(poll.pollId.toNumber()).toEqual(1)
    expect(poll.description).toEqual("Who's going to win the war?")
    expect(poll.pollStart.toNumber()).toBeLessThan(poll.pollEnd.toNumber())
  })

  it('Initialize Candidate', async () => {
    const [pollAddress] = PublicKey.findProgramAddressSync([new BN(1).toArrayLike(Buffer, 'le', 8)], PROGRAM_ID)
    const poll = await votingProgram.account.poll.fetch(pollAddress)

    console.log(poll, 'Poll before Initializing candidates')

    console.log('Initializing candidates...')
    await votingProgram.methods.initializeCandidate('iran', new BN(1)).rpc()
    await votingProgram.methods.initializeCandidate('israel', new BN(1)).rpc()

    const [firstCandidateAddress] = PublicKey.findProgramAddressSync(
      [Buffer.from('iran'), new BN(1).toArrayLike(Buffer, 'le', 8)],
      PROGRAM_ID,
    )
    const [secondCandidateAddress] = PublicKey.findProgramAddressSync(
      [Buffer.from('israel'), new BN(1).toArrayLike(Buffer, 'le', 8)],
      PROGRAM_ID,
    )

    const iranCandidate = await votingProgram.account.candidate.fetch(firstCandidateAddress)
    const israelCandidate = await votingProgram.account.candidate.fetch(secondCandidateAddress)

    console.log('Iran candidate:', iranCandidate)
    console.log('Israel candidate:', israelCandidate)

    const updatedPoll = await votingProgram.account.poll.fetch(pollAddress)

    console.log(updatedPoll, 'Poll after Initializing candidates')

    expect(iranCandidate.candidateName).toEqual('iran')
    expect(israelCandidate.candidateName).toEqual('israel')
    expect(iranCandidate.candidateVotes.toNumber()).toEqual(0)
    expect(israelCandidate.candidateVotes.toNumber()).toEqual(0)
    expect(updatedPoll.candidateAmount.toNumber()).toEqual(2)
  })

  it('vote', async () => {
    const [candidateAddress] = PublicKey.findProgramAddressSync(
      [Buffer.from('iran'), new BN(1).toArrayLike(Buffer, 'le', 8)],
      PROGRAM_ID,
    )
    const candidate = await votingProgram.account.candidate.fetch(candidateAddress)

    console.log(candidate, 'Candidate before voting')

    await votingProgram.methods.vote('iran', new BN(1)).rpc()

    const updateCandidate = await votingProgram.account.candidate.fetch(candidateAddress)

    console.log(updateCandidate, 'Candidate after voting')
    expect(updateCandidate.candidateVotes.toNumber()).toEqual(1)
  })
})
