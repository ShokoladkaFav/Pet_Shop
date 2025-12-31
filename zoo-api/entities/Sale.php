<?php
namespace Entities;

use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity]
#[ORM\Table(name: 'sales')]
class Sale {
    #[ORM\Id]
    #[ORM\Column(name: 'product_id', type: 'integer')]
    public int $product_id;

    #[ORM\Column(type: 'decimal', precision: 10, scale: 2)]
    public float $sale_price;

    #[ORM\Column(type: 'decimal', precision: 10, scale: 2)]
    public float $original_price;

    #[ORM\OneToOne(targetEntity: Product::class)]
    #[ORM\JoinColumn(name: 'product_id', referencedColumnName: 'product_id')]
    public ?Product $product = null;
}