import type { PostingItem } from '../types';

const today = new Date();
const addDays = (days: number) => {
  const d = new Date(today);
  d.setDate(d.getDate() + days);
  return d.toISOString();
};

export const mockPostingItems: PostingItem[] = [
  {
    id: 'pi1',
    applicationId: 'a1',
    bulletinBoardId: 'bb1',
    quantity: 3,
    needTop: true,
    status: 'posted',
    photoUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=bulletin%20board%20with%20posters%20on%20wall%20school%20hallway&image_size=landscape_4_3',
    postedAt: addDays(-5),
  },
  {
    id: 'pi2',
    applicationId: 'a1',
    bulletinBoardId: 'bb4',
    quantity: 2,
    needTop: false,
    status: 'posted',
    photoUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cafeteria%20bulletin%20board%20with%20colorful%20posters&image_size=landscape_4_3',
    postedAt: addDays(-5),
  },
  {
    id: 'pi3',
    applicationId: 'a2',
    bulletinBoardId: 'bb2',
    quantity: 2,
    needTop: false,
    status: 'posted',
    photoUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=school%20corridor%20bulletin%20board%20with%20tech%20posters&image_size=landscape_4_3',
    postedAt: addDays(-3),
  },
  {
    id: 'pi4',
    applicationId: 'a2',
    bulletinBoardId: 'bb3',
    quantity: 3,
    needTop: true,
    status: 'posted',
    photoUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=classroom%20building%20entrance%20bulletin%20board&image_size=landscape_4_3',
    postedAt: addDays(-3),
  },
  {
    id: 'pi5',
    applicationId: 'a3',
    bulletinBoardId: 'bb6',
    quantity: 4,
    needTop: true,
    status: 'pending',
  },
  {
    id: 'pi6',
    applicationId: 'a4',
    bulletinBoardId: 'bb7',
    quantity: 2,
    needTop: true,
    status: 'pending',
  },
  {
    id: 'pi7',
    applicationId: 'a6',
    bulletinBoardId: 'bb4',
    quantity: 3,
    needTop: false,
    status: 'expired',
    postedAt: addDays(-10),
  },
];
