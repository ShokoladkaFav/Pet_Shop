<?php
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity]
#[ORM\Table(name: 'orders')]
class Order
{
    #[ORM\Id]
    #[ORM\Column(type: 'integer')]
    #[ORM\GeneratedValue]
    public int $order_id;

    #[ORM\Column(type: 'string')]
    public string $order_number;

    #[ORM\Column(type: 'integer')]
    public int $inventory_id;

    #[ORM\Column(type: 'integer')]
    public int $quantity;

    #[ORM\Column(type: 'decimal', precision: 10, scale: 2)]
    public float $price;

    #[ORM\Column(type: 'decimal', precision: 10, scale: 2)]
    public float $subtotal;

    #[ORM\Column(type: 'datetime')]
    public DateTime $order_date;

    #[ORM\Column(type: 'string')]
    public string $status;
}
?>