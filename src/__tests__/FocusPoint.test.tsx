import React from 'react';
import ImageFocusPoint from '@/components/FocusPoint';
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';

// Mock the cn utility
jest.mock('../utils/cn', () => ({
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
    expect(focalPoint).toHaveClass('size-8');
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

  test('does not update focus point on container click when allowImageClick is false', () => {
    render(<ImageFocusPoint src={testSrc} onChange={mockOnChange} allowImageClick={false} />);

    // Find the container through the image element
    const image = screen.getByAltText('');
    const container = image.parentElement;
    if (!container) throw new Error('Container not found');

    // Simulate click at (75, 75)
    fireEvent.click(container, { clientX: 75, clientY: 75 });

    // Check that onChange was not called
    expect(mockOnChange).not.toHaveBeenCalled();

    // Focal point should remain at default position
    const focalPoint = screen.getByLabelText('Focal point');
    expect(focalPoint).toHaveStyle('left: 50%');
    expect(focalPoint).toHaveStyle('top: 50%');
  });

  test('updates focus point when dragging the focal point', () => {
    render(<ImageFocusPoint src={testSrc} onChange={mockOnChange} />);

    const focalPoint = screen.getByLabelText('Focal point');
    const image = screen.getByAltText('');
    const container = image.parentElement;
    if (!container) throw new Error('Container not found');

    // Start dragging (mousedown)
    fireEvent.mouseDown(focalPoint);

    // Move to (150, 150) which should be 50% from the left and 50% from the top
    fireEvent.mouseMove(container, { clientX: 150, clientY: 150 });

    // Check if onChange was called
    expect(mockOnChange).toHaveBeenCalledWith({ x: 50, y: 50 });

    // Move to (225, 225) which should be 75% from the left and 75% from the top
    fireEvent.mouseMove(container, { clientX: 225, clientY: 225 });

    // Check if onChange was called with the updated values
    expect(mockOnChange).toHaveBeenCalledWith({ x: 75, y: 75 });

    // Stop dragging (mouseup)
    fireEvent.mouseUp(focalPoint);

    // Clear the mock to check if further moves are ignored
    mockOnChange.mockClear();

    // Try to move again (should not work since we're no longer dragging)
    fireEvent.mouseMove(container, { clientX: 60, clientY: 60 });

    // Check that onChange wasn't called again
    expect(mockOnChange).not.toHaveBeenCalled();
  });

  test('handles mouseUp outside the component', () => {
    render(<ImageFocusPoint src={testSrc} onChange={mockOnChange} />);

    const focalPoint = screen.getByLabelText('Focal point');
    const image = screen.getByAltText('');
    const container = image.parentElement;
    if (!container) throw new Error('Container not found');

    // Start dragging
    fireEvent.mouseDown(focalPoint);

    // Move within container
    fireEvent.mouseMove(container, { clientX: 150, clientY: 150 });
    expect(mockOnChange).toHaveBeenCalled();

    mockOnChange.mockClear();

    // Simulate mouseup on document body (outside component)
    fireEvent.mouseUp(document.body);

    // Try to move again
    fireEvent.mouseMove(container, { clientX: 100, clientY: 100 });

    // Check that onChange wasn't called again (drag operation should have ended)
    expect(mockOnChange).not.toHaveBeenCalled();
  });

  test('correctly handles boundary conditions (0% and 100%)', () => {
    render(<ImageFocusPoint src={testSrc} onChange={mockOnChange} />);

    const image = screen.getByAltText('');
    const container = image.parentElement;
    if (!container) throw new Error('Container not found');

    // Click at coordinate (-10, -10) which should clamp to (0%, 0%)
    fireEvent.click(container, { clientX: -10, clientY: -10 });
    expect(mockOnChange).toHaveBeenCalledWith({ x: 0, y: 0 });

    // Click at coordinate (310, 310) which should clamp to (100%, 100%)
    fireEvent.click(container, { clientX: 310, clientY: 310 });
    expect(mockOnChange).toHaveBeenCalledWith({ x: 100, y: 100 });
  });

  test('applies correct classes based on state', () => {
    render(<ImageFocusPoint src={testSrc} onChange={mockOnChange} />);

    const image = screen.getByAltText('');
    const container = image.parentElement;
    if (!container) throw new Error('Container not found');

    // Check initial container class (should have cursor-crosshair)
    expect(container).toHaveClass('cursor-crosshair');

    // Check initial focal point class (should have cursor-grab)
    const focalPoint = screen.getByLabelText('Focal point');
    expect(focalPoint).toHaveClass('cursor-grab');
    expect(focalPoint).not.toHaveClass('cursor-grabbing');

    // Start dragging
    fireEvent.mouseDown(focalPoint);

    // Focal point should now have cursor-grabbing
    expect(focalPoint).toHaveClass('cursor-grabbing');
    expect(focalPoint).not.toHaveClass('cursor-grab');
  });

  test('applies custom className to container', () => {
    const customClass = 'custom-test-class';

    render(<ImageFocusPoint src={testSrc} onChange={mockOnChange} className={customClass} />);

    const image = screen.getByAltText('');
    const container = image.parentElement;
    expect(container).toHaveClass(customClass);
  });
});
