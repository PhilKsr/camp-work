import dynamic from 'next/dynamic';
import MapLoadingSkeleton from './MapLoadingSkeleton';

const MapViewInner = dynamic(() => import('./MapViewInner'), {
  ssr: false,
  loading: () => <MapLoadingSkeleton />,
});

export default function MapView() {
  return <MapViewInner />;
}
