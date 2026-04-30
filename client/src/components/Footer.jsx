import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import Logo from './Logo';
import { Heart, Github, Twitter, Mail } from 'lucide-react';

export default function Footer() {
  const { t } = useTranslation();
  return (
    <footer className="mt-16 border-t border-white/20 dark:border-white/5">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Logo />
            <p className="mt-3 text-sm opacity-70 leading-relaxed max-w-xs">
              {t('footer.tagline')}
            </p>
            <div className="flex items-center gap-3 mt-4">
              <a
                href="#"
                className="w-9 h-9 rounded-full glass flex items-center justify-center hover:bg-white/70 dark:hover:bg-white/10 transition-colors"
                aria-label="Twitter"
              >
                <Twitter size={15} />
              </a>
              <a
                href="#"
                className="w-9 h-9 rounded-full glass flex items-center justify-center hover:bg-white/70 dark:hover:bg-white/10 transition-colors"
                aria-label="GitHub"
              >
                <Github size={15} />
              </a>
              <a
                href="mailto:hello@with-u.app"
                className="w-9 h-9 rounded-full glass flex items-center justify-center hover:bg-white/70 dark:hover:bg-white/10 transition-colors"
                aria-label="Email"
              >
                <Mail size={15} />
              </a>
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-semibold text-sm mb-3 opacity-90">Product</h4>
            <ul className="space-y-2 text-sm opacity-70">
              <li><a href="#features" className="hover:opacity-100 transition-opacity">Features</a></li>
              <li><a href="#mission" className="hover:opacity-100 transition-opacity">Mission</a></li>
              <li><Link to="/signup" className="hover:opacity-100 transition-opacity">Get Started</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold text-sm mb-3 opacity-90">Company</h4>
            <ul className="space-y-2 text-sm opacity-70">
              <li><a href="#mission" className="hover:opacity-100 transition-opacity">About</a></li>
              <li><a href="#contact" className="hover:opacity-100 transition-opacity">Contact</a></li>
              <li><a href="#" className="hover:opacity-100 transition-opacity">Careers</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold text-sm mb-3 opacity-90">Legal</h4>
            <ul className="space-y-2 text-sm opacity-70">
              <li><a href="#" className="hover:opacity-100 transition-opacity">Privacy Policy</a></li>
              <li><a href="#" className="hover:opacity-100 transition-opacity">Terms of Use</a></li>
              <li><a href="#" className="hover:opacity-100 transition-opacity">Cookie Policy</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-white/15 dark:border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs opacity-60">
          <p>{t('footer.copyright')}</p>
          <p className="flex items-center gap-1">
            Made with <Heart size={12} className="text-warm-500 fill-warm-500" /> for those who carry others
          </p>
        </div>
      </div>
    </footer>
  );
}
