import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import ImageFocusPoint from '../src/components/FocusPoint';

// Mock the cn utility
jest.mock('../src/utils/cn', () => ({
  cn: (...classes: string[]) => classes.filter(Boolean).join(' ')
}));

describe('ImageFocusPoint', () => {
  const mockOnChange = jest.fn();
  const testSrc = 'https://example.com/test-image.jpg';

  beforeEach(() => {
    // Clear mock calls between tests
    mockOnChange.mockClear();

    // Mock getBoundingClientRect for container calculations
    Element.prototype.getBoundingClientRect = jest.fn(() => ({
      width: 300,
      height: 300,
      top: 0,
      left: 0,
      right: 300,
      bottom: 300,
      x: 0,
      y: 0,
      toJSON: () => {}
    }));
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('renders with default props', () => {
    render(<ImageFocusPoint src={testSrc} onChange={mockOnChange} />);

    // Check if image is rendered
    const image = screen.getByAltText('');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', testSrc);

    // Check if focal point indicator is rendered at default position (50%, 50%)
    const focalPoint = screen.getByLabelText('Focal point');
    expect(focalPoint).toBeInTheDocument();
    expect(focalPoint).toHaveStyle('left: 50%');
    expect(focalPoint).toHaveStyle('top: 50%');
  });

  test('renders with custom initial focus point', () => {
    const customFocusPoint = { x: 25, y: 75 };

    render(<ImageFocusPoint src={testSrc} onChange={mockOnChange} focusPoint={customFocusPoint} />);

    // Check if focal point indicator is rendered at custom position
    const focalPoint = screen.getByLabelText('Focal point');
    expect(focalPoint).toHaveStyle('left: 25%');
    expect(focalPoint).toHaveStyle('top: 75%');
  });

  test('updates focus point when initialFocusPoint prop changes', () => {
    const { rerender } = render(
      <ImageFocusPoint src={testSrc} onChange={mockOnChange} focusPoint={{ x: 30, y: 40 }} />
    );

    // Check initial position
    let focalPoint = screen.getByLabelText('Focal point');
    expect(focalPoint).toHaveStyle('left: 30%');
    expect(focalPoint).toHaveStyle('top: 40%');

    // Update focusPoint prop
    rerender(<ImageFocusPoint src={testSrc} onChange={mockOnChange} focusPoint={{ x: 60, y: 70 }} />);

    // Check if position updated
    focalPoint = screen.getByLabelText('Focal point');
    expect(focalPoint).toHaveStyle('left: 60%');
    expect(focalPoint).toHaveStyle('top: 70%');
  });

  test('applies custom indicator size', () => {
    render(<ImageFocusPoint src={testSrc} onChange={mockOnChange} indicatorSize='lg' />);

    const focalPoint = screen.getByLabelText('Focal point');
    expect(focalPoint).toHaveClass('w-8 h-8');
  });

  test('applies custom container size', () => {
    const customSize = { width: '500px', height: '400px' };

    render(<ImageFocusPoint src={testSrc} onChange={mockOnChange} containerSize={customSize} />);

    // Find image by its src attribute instead of role
    const image = screen.getByAltText('');
    const container = image.parentElement;
    expect(container).toHaveStyle(`width: ${customSize.width}`);
    expect(container).toHaveStyle(`height: ${customSize.height}`);
  });

  test('updates focus point on container click when allowImageClick is true', () => {
    render(<ImageFocusPoint src={testSrc} onChange={mockOnChange} />);

    // Find the container through the image element
    const image = screen.getByAltText('');
    const container = image.parentElement;
    if (!container) throw new Error('Container not found');

    // Simulate click at (75, 75) which should be 25% from the left and 25% from the top
    fireEvent.click(container, { clientX: 75, clientY: 75 });

    // Check if onChange was called with the correct values
    expect(mockOnChange).toHaveBeenCalledWith({ x: 25, y: 25 });

    // Check if focal point was updated
    const focalPoint = screen.getByLabelText('Focal point');
    expect(focalPoint).toHaveStyle('left: 25%');
    expect(focalPoint).toHaveStyle('top: 25%');
  });

  test('handles keyboard navigation', () => {
    render(<ImageFocusPoint src={testSrc} onChange={mockOnChange} />);
    
    const focalPoint = screen.getByLabelText('Focal point');
    
    // Test Enter key to toggle dragging mode
    fireEvent.keyDown(focalPoint, { key: 'Enter' });