import React from 'react';
import { FiTwitter, FiGithub, FiLinkedin } from 'react-icons/fi';
import { footerData } from '../data/footer';

const icons = {
  FiTwitter,
  FiGithub,
  FiLinkedin,
};

const Footer = () => {
  return (
    <footer className="w-full max-w-4xl mx-auto mt-24 pb-8 text-center text-gray-500">
      <div className="flex justify-center space-x-6 mb-4">
        {footerData.socials.map((social) => {
          const Icon = icons[social.icon];
          return (
            <a
              key={social.name}
              href={social.href}
              className="hover:text-white transition-colors"
              aria-label={social.name}
            >
              <Icon className="h-6 w-6" />
            </a>
          );
        })}
      </div>
      <div className="flex flex-col md:flex-row justify-center items-center gap-4 mb-4 text-sm">
        {footerData.links?.map((link) => (
          <a
            key={link.name}
            href={link.href}
            className="hover:text-white transition-colors"
          >
            {link.name}
          </a>
        ))}
      </div>
      <p>{footerData.copyright}</p>
    </footer>
  );
};

export default Footer;
