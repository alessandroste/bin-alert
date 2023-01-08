import { IconBrandGitlab, IconX } from '@tabler/icons'
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { Calendar } from './Calendar/Calendar'
import { Icon } from './Components/Icon'
import { ThemeToggle } from './Components/ThemeToggle'
import { Constants } from './Constants'

import './index.css'

const calendar = new Calendar()

interface ILicense {
  project: string,
  licenseUrl: string
}

const licenses: ILicense[] = [
  {
    project: 'daisyUI',
    licenseUrl: 'https://raw.githubusercontent.com/saadeghi/daisyui/master/LICENSE'
  },
  {
    project: 'tailwindcss',
    licenseUrl: 'https://raw.githubusercontent.com/tailwindlabs/tailwindcss/master/LICENSE'
  }
]

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
    <footer className='footer p-10 bg-base-300 text-base-content'>
      <div>
        <span className='footer-title'>Links</span>
        <a
          className='link link-hover'
          href={Constants.REPO_GITLAB_URL}
          target={'_blank'}>
          Source code
        </a>
        <a
          className='link link-hover'
          href='https://opendata.swiss/en/organization/stadt-zurich'
          target={'_blank'}>
          Data source
        </a>
        <label
          className='link link-hover'
          htmlFor='modal-licenses'>
          Licenses
        </label>
      </div>
    </footer>

    <input type='checkbox' id='modal-licenses' className='modal-toggle' />
    <div className='modal'>
      <div className='modal-box relative'>
        <label htmlFor='modal-licenses' className='btn btn-sm btn-circle btn-secondary absolute right-2 top-2'>
          <IconX />
        </label>
        <h3 className='text-lg font-bold'>Licenses</h3>
        <div className='py-4'>
          <ul>
            {licenses.map((l: ILicense, i) => (<li key={i}>
              <a href={l.licenseUrl} target={'_blank'} className='link link-hover'>{l.project}</a>
            </li>))}
          </ul>
        </div>
      </div>
    </div>
  </div>
)