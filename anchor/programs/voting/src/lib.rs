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
        let poll = &mut context.accounts.poll;
        poll.poll_id = poll_id;
        poll.description = description;
        poll.poll_start = poll_start;
        poll.poll_end = poll_end;
        poll.condidate_acount = 0;

        Ok(())
    }

    pub fn initialize_condidate(
        context: Context<InitializeCondidate>,
        condidate_name: String,
    ) -> Result<()> {
        context.accounts.condidate.set_inner(Condidate {
            condidate_name,
            condidate_votes: 0,
        });

        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(condidate_name: String, poll_id: u64)]
pub struct InitializeCondidate<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,

    #[account(seeds = [poll_id.to_le_bytes().as_ref()], bump)]
    pub poll: Account<'info, Poll>,

    #[account(init, payer = signer, space = ANCHOR_DISCRIMINATOR_SIZE + Condidate::INIT_SPACE, seeds = [poll_id.to_le_bytes().as_ref(), condidate_name.as_bytes()], bump)]
    pub condidate: Account<'info, Condidate>,

    pub system_program: Program<'info, System>,
}

#[account]
#[derive(InitSpace)]
pub struct Condidate {
    #[max_len(50)]
    condidate_name: String,
    condidate_votes: u64,
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
    pub condidate_acount: u64,
}
