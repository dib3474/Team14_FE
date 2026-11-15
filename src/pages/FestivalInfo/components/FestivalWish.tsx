import Heart from '@/components/icon/HeartIcon';
import { postWish } from '@/apis/wish/postWish';
import { deleteWish } from '@/apis/wish/deleteWish';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { useState } from 'react';

const FestivalWish = ({ isMyWish, wishCount }: { isMyWish: boolean; wishCount: number }) => {
  const [isWish, setIsWish] = useState(isMyWish);
  const { festivalId } = useParams();
  const queryClient = useQueryClient();
  const { mutate: postWishMutation } = useMutation({
    mutationFn: () => postWish({ festivalId: festivalId || '' }),
    onSuccess: () => {
      setIsWish(true);
      queryClient.invalidateQueries({ queryKey: ['festival', festivalId] });
      queryClient.invalidateQueries({ queryKey: ['festivals'] });
    },
    onError: () => {
      setIsWish(false);
    },
  });
  const { mutate: deleteWishMutation } = useMutation({
    mutationFn: () => deleteWish({ festivalId: festivalId || '' }),
    onSuccess: () => {
      setIsWish(false);
      queryClient.invalidateQueries({ queryKey: ['festival', festivalId] });
      queryClient.invalidateQueries({ queryKey: ['festivals'] });
    },
    onError: () => {
      setIsWish(true);
    },
  });

  return (
    <div className="flex items-center gap-2">
      <div className="text-sm text-ui-muted">관심 {wishCount}</div>
      <button
        type="button"
        aria-label={isWish ? '관심 축제 해제' : '관심 축제 추가'}
        aria-pressed={isWish}
        onClick={() => (isWish ? deleteWishMutation() : postWishMutation())}
        className="festival-wish-button"
      >
        <Heart fill={isWish} />
      </button>
    </div>
  );
};

export default FestivalWish;
