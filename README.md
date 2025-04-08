# React Focus Point

![React Focus Point Demo](./public/demo.gif)

A React component that helps maintain the focus point of images across different viewport sizes and aspect ratios. Perfect for ensuring that important elements within your images remain centered and visible regardless of how the image is cropped or resized.

## Features

- 🎯 Maintain image focus points across different viewport sizes
- 📱 Responsive and mobile-friendly
- ⚡ Lightweight and performant
- 🎨 Customizable focus point positioning
- 🔄 Smooth transitions during resizing
- 🎮 Interactive focus point selection
- 🖌️ Customizable focus point indicator styling

## Installation

```bash
npm install react-focus-point
# or
yarn add react-focus-point
```

## Usage

```jsx
import { FocusPoint } from 'react-focus-point';
import { useState } from 'react';

function App() {
  const [focusPoint, setFocusPoint] = useState({
    x: 50, // Percentage from left (0-100)
    y: 50 // Percentage from top (0-100)
  });

  const handleFocusChange = (focusX, focusY) => {
    setFocusPoint({ x: focusX, y: focusY });
    console.log(`Focus point changed to: X: ${focusX}%, Y: ${focusY}%`);
  };

  return (
    <FocusPoint
      src='path/to/your/image.jpg'
      focusX={focusPoint.x}
      focusY={focusPoint.y}
      alt='Description of image'
      onChange={handleFocusChange}
    />
  );
}
```

## Props

| Prop                 | Type                 | Default  | Description                                           |
| -------------------- | -------------------- | -------- | ----------------------------------------------------- |
| `src`                | string               | required | Source URL of the image                               |
| `focusX`             | number               | 50       | X coordinate of focus point (0-100)                   |
| `focusY`             | number               | 50       | Y coordinate of focus point (0-100)                   |
| `alt`                | string               | ''       | Alt text for the image                                |
| `className`          | string               | ''       | Additional CSS classes                                |
| `style`              | object               | {}       | Additional inline styles                              |
| `onChange`           | function             | -        | Callback when focus point changes (x, y) => {}        |
| `indicatorSize`      | 'sm' \| 'md' \| 'lg' | 'md'     | Size of the focus point indicator                     |
| `indicatorClassName` | string               | -        | Custom Tailwind classes for the focus point indicator |

## Examples

### Basic Usage with Focus Point Tracking

```jsx
<FocusPoint
  src='/images/hero.jpg'
  focusX={30} // 30% from the left
  focusY={70} // 70% from the top
  alt='Hero image'
  onChange={(x, y) => {
    // Store focus point in state or database
    console.log(`New focus point: ${x}%, ${y}%`);
  }}
/>
```

### With Custom Styling and Focus Point Management

```jsx
function ImageEditor() {
  const [focusPoint, setFocusPoint] = useState({ x: 50, y: 50 });

  return (
    <FocusPoint
      src='/images/hero.jpg'
      focusX={focusPoint.x}
      focusY={focusPoint.y}
      alt='Hero image'
      className='my-custom-class'
      style={{ maxHeight: '500px' }}
      onChange={(x, y) => setFocusPoint({ x, y })}
    />
  );
}
```

### Customizing the Focus Point Indicator

You can customize the appearance of the focus point indicator using Tailwind classes:

```jsx
<FocusPoint
  src='/images/hero.jpg'
  focusX={50}
  focusY={50}
  alt='Hero image'
  indicatorClassName='bg-red-500/50 border-yellow-400 border-3 shadow-lg'
  onChange={(x, y) => console.log(`New focus point: ${x}%, ${y}%`)}
/>
```

You can also change the size of the indicator using the `indicatorSize` prop:

```jsx
<FocusPoint
  src='/images/hero.jpg'
  focusX={50}
  focusY={50}
  alt='Hero image'
  indicatorSize='lg' // Options: 'sm', 'md', 'lg'
  onChange={(x, y) => console.log(`New focus point: ${x}%, ${y}%`)}
/>
```

### Storing and Applying Focus Points

Once you've captured the focus points for your images, you can store them in your database or state management system and apply them to any image component. Here's how you can use the focus points with a regular image:

```jsx
// Example of storing focus points in a database
const saveFocusPoint = async (imageId, focusPoint) => {
  await db.images.update(imageId, {
    focusPoint: {
      x: focusPoint.x, // Already a percentage (0-100)
      y: focusPoint.y
    }
  });
};

// Example of applying focus points to an image
function ImageWithFocus({ image, ...props }) {
  const [error, setError] = useState(false);

  return (
    <img
      onError={() => setError(true)}
      {...props}
      alt={props.alt || ''}
      style={{
        ...(props.style || {}),
        objectFit: 'cover',
        ...(image?.focusPoint?.x && {
          objectPosition: `${image.focusPoint.x}% ${image.focusPoint.y}%`
        })
      }}
    />
  );
}

// Usage example
function Gallery() {
  const [images, setImages] = useState([]);

  return (
    <div className='gallery'>
      {images.map(image => (
        <ImageWithFocus
          key={image.id}
          image={image}
          src={image.url}
          alt={image.alt}
          style={{ width: '100%', height: '300px' }}
        />
      ))}
    </div>
  );
}
```

This approach allows you to:

1. Store focus points alongside your image metadata
2. Apply the same focus points consistently across different viewport sizes
3. Maintain the visual integrity of your images in responsive layouts
4. Create a consistent cropping experience across your application

## How It Works

React Focus Point uses CSS object-fit and object-position properties to maintain the focus point of your images. When the viewport size changes, the component automatically adjusts the image position to keep your specified focus point centered. The `onChange` handler allows you to track and persist these focus points for consistent image cropping across different viewport sizes.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT © Rafael Mendes
