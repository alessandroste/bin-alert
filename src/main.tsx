import { IconBrandGitlab } from '@tabler/icons'
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { Calendar } from './Calendar/Calendar'
import { Icon } from './Components/Icon'
import { ThemeToggle } from './Components/ThemeToggle'
import { Constants } from './Constants'
import './index.css'

let calendar = new Calendar()

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <div className='dotted'>
    <nav className='navbar sticky top-0 shadow-xl z-20 bg-base-100'>
      <div className='navbar-start'>
        <a className='btn btn-ghost text-xl'>
          <Icon className='w-6 h-6 mr-3' />BinAlert
        </a>
      </div>
      <div className='navbar-end'>
        <ThemeToggle />
        <a
          className='btn btn-ghost'
          href={Constants.REPO_GITLAB_URL}
          target={'_blank'}>
          <IconBrandGitlab />
        </a>
      </div>
    </nav>
    <React.StrictMode>
      <App
        calendar={calendar} />
    </React.StrictMode>
    <footer className="footer p-10 bg-neutral text-neutral-content">
      <div>
        <span className="footer-title">Links</span>
        <a className="link link-hover">Source</a>
      </div>
    </footer>
  </div>
)