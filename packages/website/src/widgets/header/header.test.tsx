import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import Header from './header'

describe('Header', () => {
  test('renders the header with branding, description, and action', async () => {
    render(<Header />)

    expect(screen.getByRole('logo')).toBeInTheDocument()

    //description 
    expect(screen.getByText('Los Angeles Parking Citation Data')).toBeInTheDocument();
    expect(screen.getByText('Helping L.A. make informed decisions about parking policies')).toBeInTheDocument();

    //action button
    const button = screen.getByRole('button', { name: 'HOW IT WORKS' });
    expect(button).toBeInTheDocument();

  })
})
