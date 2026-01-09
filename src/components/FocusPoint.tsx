import React, { MouseEvent, TouchEvent, useEffect, useRef, useState } from 'react';
import { cn } from '../utils/cn';
import { FocusPoint } from '../types';

export interface FocusPointProps {
  /** Source URL for the image */
  src: string;
  /** Callback function that receives the new focus point when changed */
  onChange: (focusPoint: FocusPoint) => void;
  /** Initial focus point (defaults to center: {x: 50, y: 50}) */
  focusPoint?: FocusPoint;
  /** Alt text for the image */
  alt?: string;
  /** Classname for the root element */
  className?: string;
  /** Optional size for the focus point indicator */
  indicatorSize?: 'sm' | 'md' | 'lg';
  /** Optional size constraints for the container */
  containerSize?: {
    width?: string;
    height?: string;
  };
  /** Whether to allow clicking on the image to set the focus point */
  allowImageClick?: boolean;
  /** Optional custom class name for the focus point indicator (Tailwind classes) */
  indicatorClassName?: string;
}

const DEFAULT_PERCENTAGE = 50;

/**
 * A component that allows setting a focal point on an image
 * for responsive cropping and positioning
 */
export const ImageFocusPoint: React.FC<FocusPointProps> = ({
  src,
  onChange,
  alt = '',
  focusPoint: initialFocusPoint,
  className,
  indicatorSize = 'md',
  containerSize = { width: '300px', height: '300px' },
  allowImageClick = true,
  indicatorClassName
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [x, setX] = useState<number>(initialFocusPoint?.x ?? DEFAULT_PERCENTAGE);
  const [y, setY] = useState<number>(initialFocusPoint?.y ?? DEFAULT_PERCENTAGE);
  const [canMove, setCanMove] = useState(false);
  const isDraggingRef = useRef(false); // Track if user is dragging (for touch)

  // Update internal state if external focusPoint prop changes
  useEffect(() => {
    if (initialFocusPoint) {
      setX(initialFocusPoint.x);
      setY(initialFocusPoint.y);
    }
  }, [initialFocusPoint]);

  // Map indicator size to Tailwind classes
  const indicatorSizeClasses = {
    sm: 'size-4',
    md: 'size-6',
    lg: 'size-8'
  };

  // Convert pixel coordinates to percentages
  const calculatePercentage = (value: number, max: number): number => {
    return Math.min(Math.max((value * 100) / max, 0), 100);
  };

  // Update position from pixel coordinates
  const updatePosition = (clientX: number, clientY: number): void => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const xPixels = clientX - rect.left;
    const yPixels = clientY - rect.top;

    const newX = calculatePercentage(xPixels, rect.width);
    const newY = calculatePercentage(yPixels, rect.height);

    setX(newX);
    setY(newY);
    onChange({ x: newX, y: newY });
  };

  // Handle mouse movement during dragging
  const handleMouseMove = (e: MouseEvent): void => {
    if (!canMove || !containerRef.current) return;
    updatePosition(e.clientX, e.clientY);
  };

  // Handle touch movement during dragging
  const handleTouchMove = (e: TouchEvent): void => {
    if (!canMove || !containerRef.current) return;
    const touch = e.touches[0];
    if (touch) {
      updatePosition(touch.clientX, touch.clientY);
    }
  };

  // Handle direct click on the container
  const handleContainerClick = (e: MouseEvent): void => {
    // Only skip if clicking is disabled or we're currently dragging
    if (!allowImageClick || canMove) return;

    // Skip if we're clicking on the focal point button itself
    const target = e.target as HTMLElement;
    if (target.tagName === 'BUTTON' || target.closest('button')) {
      return;
    }

    updatePosition(e.clientX, e.clientY);
  };

  // Handle direct tap on the container (mobile)
  const handleContainerTap = (e: TouchEvent): void => {
    // Only allow if clicking is enabled and we're not dragging
    if (!allowImageClick || canMove) return;

    // Skip if we're tapping on the focal point button itself
    const target = e.target as HTMLElement;
    if (target.tagName === 'BUTTON' || target.closest('button')) {
      return;
    }

    const touch = e.changedTouches[0];
    if (touch) {
      updatePosition(touch.clientX, touch.clientY);
    }
  };

  // Start dragging the focal point (mouse)
  const handleMouseDown = (e: MouseEvent): void => {
    e.preventDefault();
    e.stopPropagation(); // Prevent triggering container click
    setCanMove(true);

    // Add event listeners to handle cases where mouse up happens outside the component
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseleave', handleMouseUp);
  };

  // Stop dragging the focal point (mouse)
  const handleMouseUp = (): void => {
    setCanMove(false);
    document.removeEventListener('mouseup', handleMouseUp);
    document.removeEventListener('mouseleave', handleMouseUp);
  };

  // Start dragging the focal point (touch)
  const handleTouchStart = (e: TouchEvent): void => {
    e.preventDefault();
    e.stopPropagation();
    setCanMove(true);
    isDraggingRef.current = true;
  };

  // Stop dragging the focal point (touch)
  const handleTouchEnd = (): void => {
    setCanMove(false);
    // Reset dragging flag after a short delay to allow tap detection
    setTimeout(() => {
      isDraggingRef.current = false;
    }, 50);
  };

  return (
    <div
      ref={containerRef}
      className={cn('relative select-none', allowImageClick && !canMove && 'cursor-crosshair', className)}
      style={{
        width: containerSize.width,
        height: containerSize.height
      }}
      onMouseMove={handleMouseMove}
      onTouchMove={handleTouchMove}
      onTouchEnd={e => {
        // Only trigger tap if we weren't dragging the indicator
        if (!isDraggingRef.current) {
          handleContainerTap(e);
        }
      }}
      onClick={handleContainerClick}
    >
      {/* Focal point indicator */}
      <button
        type='button'
        aria-label='Focal point'
        style={{
          left: `${x}%`,
          top: `${y}%`
        }}
        className={cn(
          'absolute z-10 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-blue-500/50',
          indicatorSizeClasses[indicatorSize],
          canMove ? 'cursor-grabbing' : 'cursor-grab',
          indicatorClassName
        )}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onClick={e => e.stopPropagation()} // Prevent click from reaching container
        tabIndex={0}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            // Toggle the drag mode on Enter or Space
            setCanMove(prev => !prev);
          }
        }}
      />

      {/* The image */}
      <img
        style={{
          objectPosition: `${x}% ${y}%`
        }}
        className='pointer-events-none size-full select-none object-cover'
        src={src}
        alt={alt}
      />
    </div>
  );
};

export default ImageFocusPoint;
