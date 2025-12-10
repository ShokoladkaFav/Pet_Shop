<?php
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity]
#[ORM\Table(name: 'product')]
class Product
{
    #[ORM\Id]
    #[ORM\Column(type: 'integer')]
    #[ORM\GeneratedValue]
    public int $product_id;

    #[ORM\Column(type: 'string')]
    public string $name;

    #[ORM\Column(type: 'string')]
    public string $category;

    #[ORM\Column(type: 'decimal', precision: 10, scale: 2)]
    public float $price;

    #[ORM\Column(type: 'text', nullable: true)]
    public ?string $description;

    #[ORM\Column(type: 'integer')]
    public int $supplier_id;

    #[ORM\Column(type: 'string', nullable: true)]
    public ?string $image_url;
}
?>