// src/components/shop/ShopCard.tsx
'use client';

// ... imports

export function ShopCard({ shop, onEdit }: ShopCardProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col sm:flex-row gap-6">
          <div className="w-40 h-40 relative border rounded">
            {shop.logo ? (
              <Image 
                src={shop.logo} 
                alt={shop.name}
                fill
                sizes="160px"
                style={{ objectFit: "cover" }}
                className="rounded"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-100">
                <Store className="h-12 w-12 text-gray-400" />
              </div>
            )}
          </div>
          
          {/* Shop status display */}
          <div className="flex-1 space-y-6">
            <div>
              <h2 className="text-2xl font-bold">{shop.name}</h2>
              {shop.status === 'pending' ? (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 mt-2">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  Pending Approval
                </span>
              ) : shop.status === 'approved' ? (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-2">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Active
                </span>
              ) : (
                <Badge variant="destructive" className="mt-2">Rejected</Badge>
              )}
            </div>
            
            {/* Show warning message for pending shops */}
            {shop.status === 'pending' && (
              <Alert variant="default" className="bg-yellow-50 text-yellow-800 border-yellow-200">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Waiting for Approval</AlertTitle>
                <AlertDescription>
                  Your shop is currently under review. You'll receive a notification once it's approved.
                </AlertDescription>
              </Alert>
            )}
            
            {/* ... rest of the component */}
          </div>
        </div>
      </CardContent>
      {/* ... card footer */}
    </Card>
  );
}