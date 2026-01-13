
import Image from 'next/image';

interface TestimonialCardProps {
  quote: string;
  name: string;
  imgSrc: string;
}

const TestimonialCard = ({ quote, name, imgSrc }: TestimonialCardProps) => {
  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
      <p className="text-lg text-gray-300 mb-4">&quot;{quote}&quot;</p>
      <div className="flex items-center">
        <Image
          src={imgSrc}
          alt={name}
          width={48}
          height={48}
          className="rounded-full mr-4"
        />
        <div>
          <p className="font-bold text-white">{name}</p>
        </div>
      </div>
    </div>
  );
};

export default TestimonialCard;
