
import Image from 'next/image';

interface ProgramCardProps {
  imgSrc: string;
  title: string;
  description: string;
}

const ProgramCard = ({ imgSrc, title, description }: ProgramCardProps) => {
  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg">
      <Image
        src={imgSrc}
        alt={title}
        width={400}
        height={250}
        className="object-cover"
      />
      <div className="p-6">
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-gray-400">{description}</p>
      </div>
    </div>
  );
};

export default ProgramCard;
