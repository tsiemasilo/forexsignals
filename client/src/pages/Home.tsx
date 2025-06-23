import { Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Truck, Award, Wrench, RotateCcw, Star, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/contexts/CartContext';
import { formatCurrency, formatRating } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import type { Brand, Category, ProductWithBrandAndCategory } from '@shared/schema';

export default function Home() {
  const { toast } = useToast();
  const { addToCart } = useCart();

  const { data: brands = [] } = useQuery<Brand[]>({
    queryKey: ['/api/brands'],
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  const { data: featuredProducts = [] } = useQuery<ProductWithBrandAndCategory[]>({
    queryKey: ['/api/products'],
  });

  const handleAddToCart = async (productId: number, productName: string) => {
    try {
      await addToCart(productId);
      toast({
        title: "Added to cart",
        description: `${productName} has been added to your cart.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add item to cart. Please try again.",
        variant: "destructive",
      });
    }
  };

  const renderStars = (rating: string) => {
    const ratingNum = formatRating(rating);
    const fullStars = Math.floor(ratingNum);
    const hasHalfStar = ratingNum % 1 !== 0;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <div className="flex text-yellow-400">
        {[...Array(fullStars)].map((_, i) => (
          <Star key={`full-${i}`} size={16} fill="currentColor" />
        ))}
        {hasHalfStar && <Star size={16} fill="currentColor" className="opacity-50" />}
        {[...Array(emptyStars)].map((_, i) => (
          <Star key={`empty-${i}`} size={16} />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-auto-gray to-gray-800 text-white py-20">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-5xl font-bold mb-6">Premium Car Parts & Accessories</h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Find genuine parts for your vehicle from trusted brands. Quality guaranteed, fast shipping worldwide.
          </p>
          <div className="relative mt-12 rounded-xl overflow-hidden shadow-2xl">
            <img
              src="https://images.unsplash.com/photo-1486754735734-325b5831c3ad?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=400"
              alt="Modern automotive parts shop interior"
              className="w-full h-80 object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
              <Link href="/parts">
                <Button size="lg" className="bg-auto-red hover:bg-red-700 text-lg font-semibold">
                  Shop Now <ArrowRight className="ml-2" size={20} />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-12 bg-auto-light">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="flex flex-col items-center">
              <Truck className="text-3xl text-auto-blue mb-3" size={48} />
              <h3 className="font-semibold">Fast Shipping</h3>
              <p className="text-sm text-gray-600">Next day delivery</p>
            </div>
            <div className="flex flex-col items-center">
              <Award className="text-3xl text-auto-blue mb-3" size={48} />
              <h3 className="font-semibold">Genuine Parts</h3>
              <p className="text-sm text-gray-600">100% authentic</p>
            </div>
            <div className="flex flex-col items-center">
              <Wrench className="text-3xl text-auto-blue mb-3" size={48} />
              <h3 className="font-semibold">Expert Support</h3>
              <p className="text-sm text-gray-600">Technical assistance</p>
            </div>
            <div className="flex flex-col items-center">
              <RotateCcw className="text-3xl text-auto-blue mb-3" size={48} />
              <h3 className="font-semibold">Easy Returns</h3>
              <p className="text-sm text-gray-600">30-day guarantee</p>
            </div>
          </div>
        </div>
      </section>

      {/* Car Brands Section */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-auto-gray mb-4">Choose Your Car Brand</h2>
            <p className="text-lg text-gray-600">Select your vehicle brand to find compatible parts</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {brands.map((brand) => (
              <Link
                key={brand.id}
                href={`/parts?brand=${brand.slug}`}
                className="block"
              >
                <Card className="hover:border-auto-blue hover:shadow-lg transition-all duration-300 group cursor-pointer">
                  <CardContent className="p-8 text-center">
                    <img
                      src={brand.logoUrl || '/placeholder-brand.jpg'}
                      alt={`${brand.name} logo`}
                      className="w-full h-16 object-contain mb-4"
                    />
                    <h3 className="font-semibold text-auto-gray group-hover:text-auto-blue transition-colors">
                      {brand.name}
                    </h3>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Part Categories Section */}
      <section className="py-16 bg-auto-light">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-auto-gray mb-4">Parts Categories</h2>
            <p className="text-lg text-gray-600">Browse by part category to find what you need</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/parts?category=${category.slug}`}
                className="block"
              >
                <Card className="hover:shadow-xl transition-shadow cursor-pointer h-full">
                  <CardContent className="p-6">
                    <div className="flex items-center mb-3">
                      <div className="w-8 h-8 bg-auto-blue rounded-full flex items-center justify-center mr-3">
                        <div className="w-4 h-4 bg-white rounded-full" />
                      </div>
                      <h3 className="text-xl font-semibold">{category.name}</h3>
                    </div>
                    <p className="text-gray-600 mb-4">{category.description}</p>
                    <Button variant="ghost" className="text-auto-blue hover:text-blue-700 p-0">
                      Browse {category.name} <ArrowRight className="ml-2" size={16} />
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-auto-gray mb-4">Featured Products</h2>
            <p className="text-lg text-gray-600">Popular parts with great reviews</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {featuredProducts.slice(0, 8).map((product) => (
              <Card key={product.id} className="hover:shadow-xl transition-shadow">
                <CardContent className="p-0">
                  <img
                    src={product.imageUrl || '/placeholder-product.jpg'}
                    alt={product.name}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="secondary" className="text-xs">
                        {product.brand?.name || 'Universal'}
                      </Badge>
                      {product.rating && renderStars(product.rating)}
                    </div>
                    <h3 className="font-semibold text-auto-gray mb-2">{product.name}</h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {product.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-auto-red">
                        {formatCurrency(product.price)}
                      </span>
                      <Button
                        size="sm"
                        className="bg-auto-blue hover:bg-blue-700"
                        onClick={() => handleAddToCart(product.id, product.name)}
                      >
                        <ShoppingCart size={16} />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/parts">
              <Button size="lg" className="bg-auto-blue hover:bg-blue-700">
                View All Products <ArrowRight className="ml-2" size={20} />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
