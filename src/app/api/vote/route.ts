export const OPTIONS = GET

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
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,PUT,OPTIONS',
      'Access-Control-Allow-Headers':
        'Content-Type, Authorization, Content-Encoding, Accept-Encoding, X-Accept-Action-Version, X-Accept-Blockchain-Ids',
      'Access-Control-Expose-Headers': 'X-Action-Version, X-Blockchain-Ids',
      'Content-Type': 'application/json',
    },
  })
}
