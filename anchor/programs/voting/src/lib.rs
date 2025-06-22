#![allow(clippy::result_large_err)]

use anchor_lang::prelude::*;

declare_id!("FqzkXZdwYjurnUKetJCAvaUw5WAqbwzU6gZEwydeEfqS");

pub const ANCHOR_DISCRIMINATOR_SIZE: usize = 8;

#[program]
pub mod voting {
    use super::*;

    pub fn initialize_poll(
        context: Context<InitializePoll>,
        poll_id: u64,
        description: String,
        poll_start: u64,
        poll_end: u64,
    ) -> Result<()> {
        context.accounts.poll.set_inner(Poll {
            poll_id,
            description,
            poll_start,
            poll_end,
            candidate_amount: 0,
        });

        Ok(())
    }

    pub fn initialize_candidate(
        context: Context<InitializeCandidate>,
        candidate_name: String,
        _poll_id: u64,
    ) -> Result<()> {
        context.accounts.candidate.set_inner(Candidate {
            candidate_name,
            candidate_votes: 0,
        });

        context.accounts.poll.candidate_amount += 1;

        Ok(())
    }

    pub fn vote(context: Context<Vote>, candidate_name: String, poll_id: u64) -> Result<()> {
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Vote {}

#[derive(Accounts)]
#[instruction(candidate_name: String, poll_id: u64)]
pub struct InitializeCandidate<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,

    #[account(mut, seeds = [poll_id.to_le_bytes().as_ref()], bump)]
    pub poll: Account<'info, Poll>,

    #[account(init, payer = signer, space = ANCHOR_DISCRIMINATOR_SIZE + Candidate::INIT_SPACE, seeds = [candidate_name.as_bytes(), poll_id.to_le_bytes().as_ref()], bump)]
    pub candidate: Account<'info, Candidate>,

    pub system_program: Program<'info, System>,
}

#[account]
#[derive(InitSpace)]
pub struct Candidate {
    #[max_len(50)]
    candidate_name: String,
    candidate_votes: u64,
}

#[derive(Accounts)]
#[instruction(poll_id: u64)]
pub struct InitializePoll<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,

    #[account(init, payer = signer, space = ANCHOR_DISCRIMINATOR_SIZE + Poll::INIT_SPACE, seeds = [poll_id.to_le_bytes().as_ref()], bump)]
    pub poll: Account<'info, Poll>,

    pub system_program: Program<'info, System>,
}

#[account]
#[derive(InitSpace)]
pub struct Poll {
    pub poll_id: u64,
    #[max_len(280)]
    pub description: String,
    pub poll_start: u64,
    pub poll_end: u64,
    pub candidate_amount: u64,
}
