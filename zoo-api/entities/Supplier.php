<?php
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity]
#[ORM\Table(name: 'supplier')]
class Supplier
{
    #[ORM\Id]
    #[ORM\Column(type: 'integer')]
    #[ORM\GeneratedValue]
    public int $supplier_id;

    #[ORM\Column(type: 'string')]
    public string $name;

    #[ORM\Column(type: 'string', nullable: true)]
    public ?string $contact_person;

    #[ORM\Column(type: 'string', nullable: true)]
    public ?string $phone;

    #[ORM\Column(type: 'string', nullable: true)]
    public ?string $email;

    #[ORM\Column(type: 'string', nullable: true)]
    public ?string $address;
}
?>