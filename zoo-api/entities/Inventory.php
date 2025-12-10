<?php
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity]
#[ORM\Table(name: 'inventory')]
class Inventory
{
    #[ORM\Id]
    #[ORM\Column(type: 'integer')]
    #[ORM\GeneratedValue]
    public int $inventory_id;

    #[ORM\Column(type: 'integer')]
    public int $product_id;

    #[ORM\Column(type: 'integer')]
    public int $quantity;

    #[ORM\Column(type: 'string')]
    public string $location;
}
?>