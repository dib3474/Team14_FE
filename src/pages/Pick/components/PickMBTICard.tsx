import Button from '@/components/common/Button';
import { usePick } from '@/context/PickContext';

interface PickMBTICardProps {
  id: string;
  title: string;
  option1: string;
  option2: string;
}

const PickMBTICard = ({ id, title, option1, option2 }: PickMBTICardProps) => {
  const { mbtiAnswers, handleMbtiAnswer } = usePick();
  return (
    <fieldset className="pick-mbti-question">
      <legend className="ui-body font-bold">{title}</legend>
      <div className="pick-mbti-options">
        <Button
          variant={mbtiAnswers[id] === true ? 'primary' : 'tertiary'}
          className="pick-mbti-option"
          fullWidth
          aria-pressed={mbtiAnswers[id] === true}
          onClick={() => handleMbtiAnswer(id, true)}
        >
          {option1}
        </Button>
        <Button
          variant={mbtiAnswers[id] === false ? 'primary' : 'tertiary'}
          className="pick-mbti-option"
          fullWidth
          aria-pressed={mbtiAnswers[id] === false}
          onClick={() => handleMbtiAnswer(id, false)}
        >
          {option2}
        </Button>
      </div>
    </fieldset>
  );
};

export default PickMBTICard;
