import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Grid, List, ShoppingCart, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useCart } from '@/contexts/CartContext';
import { formatCurrency, formatRating } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import type { Brand, Category, ProductWithBrandAndCategory } from '@shared/schema';

export default function Parts() {
  const [location] = useLocation();
  const { toast } = useToast();
  const { addToCart } = useCart();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Parse URL parameters
  useEffect(() => {
    const params = new URLSearchParams(location.split('?')[1] || '');
    setSelectedBrand(params.get('brand') || 'all');
    setSelectedCategory(params.get('category') || 'all');
    setSearchQuery(params.get('search') || '');
  }, [location]);

  const { data: brands = [] } = useQuery<Brand[]>({
    queryKey: ['/api/brands'],
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  const { data: products = [], isLoading } = useQuery<ProductWithBrandAndCategory[]>({
    queryKey: ['/api/products', selectedBrand, selectedCategory, searchQuery],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedBrand && selectedBrand !== 'all') params.append('brand', selectedBrand);
      if (selectedCategory && selectedCategory !== 'all') params.append('category', selectedCategory);
      if (searchQuery) params.append('search', searchQuery);
      
      const response = await fetch(`/api/products?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch products');
      return response.json();
    },
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (selectedBrand && selectedBrand !== 'all') params.append('brand', selectedBrand);
    if (selectedCategory && selectedCategory !== 'all') params.append('category', selectedCategory);
    if (searchQuery) params.append('search', searchQuery);
    
    window.history.pushState({}, '', `/parts?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-auto-gray mb-4">Car Parts</h1>
          <p className="text-lg text-gray-600">Find the perfect parts for your vehicle</p>
        </div>

        {/* Filters */}
        <div className="mb-8 space-y-4">
          <form onSubmit={handleSearch} className="flex gap-4 flex-wrap">
            <Input
              type="search"
              placeholder="Search parts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 min-w-[200px]"
            />
            <Select value={selectedBrand} onValueChange={setSelectedBrand}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Brands" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Brands</SelectItem>
                {brands.map((brand) => (
                  <SelectItem key={brand.id} value={brand.slug}>
                    {brand.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.slug}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button type="submit" className="bg-auto-blue hover:bg-blue-700">
              Search
            </Button>
          </form>

          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              {products.length} products found
            </div>
            <div className="flex space-x-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid size={16} />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List size={16} />
              </Button>
            </div>
          </div>
        </div>

        {/* Products */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-auto-blue mx-auto"></div>
            <p className="mt-4">Loading products...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg text-gray-600">No products found. Try adjusting your filters.</p>
          </div>
        ) : (
          <div className={viewMode === 'grid' 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            : "space-y-4"
          }>
            {products.map((product) => (
              <Card key={product.id} className={`hover:shadow-xl transition-shadow ${
                viewMode === 'list' ? 'flex' : ''
              }`}>
                <CardContent className={`p-0 ${viewMode === 'list' ? 'flex w-full' : ''}`}>
                  <img
                    src={product.imageUrl || '/placeholder-product.jpg'}
                    alt={product.name}
                    className={`object-cover ${
                      viewMode === 'list' 
                        ? 'w-48 h-32 rounded-l-lg' 
                        : 'w-full h-48 rounded-t-lg'
                    }`}
                  />
                  <div className={`p-4 ${viewMode === 'list' ? 'flex-1 flex flex-col justify-between' : ''}`}>
                    <div>
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
                    </div>
                    <div className={`flex items-center ${
                      viewMode === 'list' ? 'justify-between' : 'justify-between'
                    }`}>
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
        )}
      </div>
    </div>
  );
}
