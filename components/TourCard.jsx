import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Calendar, Flag, Users } from 'lucide-react';

export default function TourCard({ tour }) {
  const cover = tour.imageCover?.startsWith('http')
    ? tour.imageCover
    : `/img/tours/${tour.imageCover}`;

  const nextDate = tour.startDates?.[0]
    ? new Date(tour.startDates[0]).toLocaleString('en-US', {
        month: 'long',
        year: 'numeric',
      })
    : '—';

  return (
    <div className="rounded-sm overflow-hidden shadow-card bg-white flex flex-col transition-transform duration-300 hover:-translate-y-1">
      <div className="relative">
        <div className="relative h-[220px] clip-card-picture">
          <Image
            src={cover}
            alt={tour.name}
            fill        
            sizes="(min-width: 1024px) 33vw, 100vw"
            className="object-cover"
          />
        </div>
        <h3 className="absolute bottom-4 right-5 z-20 w-[70%] text-right text-2xl sm:text-[27.5px] text-white font-light uppercase leading-[1.6]">
          <span className="heading-primary-span bg-gradient-primary-soft px-[15px] py-[10px] leading-none">
            {tour.name}
          </span>
        </h3>
      </div>

      <div className="grid grid-cols-2 gap-x-[17.5px] gap-y-[20px] px-[30px] py-[25px]">
        <h4 className="col-span-2 text-xs font-bold uppercase">
          {tour.difficulty} {tour.duration}-day tour
        </h4>
        <p className="col-span-2 text-sm italic -mt-2 mb-1 text-grey-600">
          {tour.summary}
        </p>

        <div className="flex items-center text-[0.8125rem] text-grey-600 gap-2">
          <MapPin size={20} className="text-primary shrink-0" />
          <span>{tour.startLocation?.description}</span>
        </div>
        <div className="flex items-center text-[0.8125rem] text-grey-600 gap-2">
          <Calendar size={20} className="text-primary shrink-0" />
          <span>{nextDate}</span>
        </div>
        <div className="flex items-center text-[0.8125rem] text-grey-600 gap-2">
          <Flag size={20} className="text-primary shrink-0" />
          <span>{tour.locations?.length ?? 0} stops</span>
        </div>
        <div className="flex items-center text-[0.8125rem] text-grey-600 gap-2">
          <Users size={20} className="text-primary shrink-0" />
          <span>{tour.maxGroupSize} people</span>
        </div>
      </div>

      <div className="mt-auto flex items-center justify-between bg-grey-100 border-t border-grey-200/60 px-[30px] py-[25px] text-[14px]">
        <div className="flex flex-col gap-[10px]">
          <p>
            <span className="font-bold">${tour.price}</span>{' '}
            <span className="text-grey-500">per person</span>
          </p>
          <p>
            <span className="font-bold">{tour.ratingsAverage}</span>{' '}
            <span className="text-grey-500">rating ({tour.ratingsQuantity})</span>
          </p>
        </div>
        <Link
          href={`/tour/${tour.slug}`}
          className="inline-block bg-primary text-white uppercase rounded-full px-[30px] py-[12.5px] transition-colors hover:bg-primary-light"
        >
          Details
        </Link>
      </div>
    </div>
  );
}
