import Link from 'next/link';
import Image from 'next/image';

const links = [
  { label: 'About us', href: '#' },
  { label: 'Download our apps', href: '#' },
  { label: 'Become a guide', href: '#' },
  { label: 'Careers', href: '#' },
  { label: 'Contact', href: '#' },
];

export default function Footer() {
  return (
    <footer className="bg-grey-100 px-6 sm:px-8 lg:px-10 pt-[60px] pb-[30px] text-sm grid grid-cols-1 md:grid-cols-2 gap-y-5 justify-items-center md:justify-items-stretch">
      <div className="flex md:items-center">
        <Image 
          src="/img/logo-green.png"
          alt="Natours Logo"
          width={150}
          height={30}
          className="h-9"
        />
      </div>

      <div className="flex flex-col justify-between md:items-end space-y-2">
        <ul className="flex flex-wrap justify-center md:justify-end gap-x-6 gap-y-2 list-none">
          {links.map((link) => (
            <li key={link.label}>
              <a
                href={link.href}
                className="text-grey-600 no-underline transition-colors hover:text-primary"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <p className="text-grey-500 justify-self-center md:justify-self-end order-2 md:order-3">
          &copy; by Mohamed Haytham. All rights reserved!
        </p>
      </div>
      
    </footer>
  );
}
