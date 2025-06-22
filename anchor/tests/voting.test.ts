import { BankrunProvider, startAnchor } from 'anchor-bankrun'
import { PublicKey } from '@solana/web3.js'
import { BN, Program } from '@coral-xyz/anchor'
import { Voting } from '../target/types/voting'
import IDL from '../target/idl/voting.json'
import { expect } from '@jest/globals'

const votingAddress = new PublicKey('FqzkXZdwYjurnUKetJCAvaUw5WAqbwzU6gZEwydeEfqS')

describe('Voting', () => {
  it('Initialize Poll', async () => {
    const context = await startAnchor('', [{ name: 'voting', programId: votingAddress }], [])

    const provider = new BankrunProvider(context)

    const votingProgram = new Program<Voting>(IDL, provider)

    await votingProgram.methods.initializePoll(new BN(1), 'this is a description', new BN(0), new BN(1850536880)).rpc()

    const [pollAddress] = PublicKey.findProgramAddressSync([new BN(1).toArrayLike(Buffer, 'le', 8)], votingAddress)

    const poll = await votingProgram.account.poll.fetch(pollAddress)
    console.log(poll, 'poll')

    expect(poll.pollId.toNumber()).toEqual(1)
    expect(poll.description).toEqual('this is a description')
    expect(poll.pollStart.toNumber()).toBeLessThan(poll.pollEnd.toNumber())
  })
})
